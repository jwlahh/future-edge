from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .supabase_client import supabase
from core.ats_engine import calculate_ats_score
from core.ml_service import recommend_roles, ModelIntegrationError

import fitz
import re


def extract_experience(text):
    exp_matches = re.findall(r'(\d+(\.\d+)?)\s*(years|yrs)', text.lower())
    total_exp = sum([float(match[0]) for match in exp_matches])
    return total_exp


def detect_images_in_pdf(doc):
    image_count = 0
    for page in doc:
        images = page.get_images()
        if images:
            image_count += len(images)
    return image_count

@api_view(['POST'])
def save_user_skills(request):

    user_id = request.data.get("user_id")
    skills = request.data.get("skills")  # list of skill names

    if not user_id or not skills:
        return Response({"error": "Missing data"}, status=400)

    # 🔴 Clear old skills
    supabase.table("user_skills") \
        .delete() \
        .eq("user_id", user_id) \
        .execute()

    # 🔵 Get skills_master
    skills_response = supabase.table("skills_master").select("*").execute()
    skills_master = skills_response.data
    def normalize(text):
        return re.sub(r'[\s\-]', '', text.lower())

    skill_map = {
        normalize(s["skill_name"]): s["skill_id"]
        for s in skills_master
    }

    for skill in skills:
        skill_clean = normalize(skill)

        skill_id = None

        for key in skill_map:
            if skill_clean == key:
                skill_id = skill_map[key]
                break

        print("Processing:", skill_clean, "→", skill_id)

        if skill_id:
            supabase.table("user_skills").insert({
                "user_id": user_id,
                "skill_id": skill_id
            }).execute()
        
    return Response({"message": "Skills saved successfully"})

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])

def upload_resume(request):
    print("FILES:", request.FILES)
    print("DATA:", request.data)

    resume_file = request.FILES.get("resume")
    user_id = request.data.get("user_id")

    if not resume_file:
        return Response({"message": "No file uploaded"}, status=400)

    text = ""

    try:
        # STEP 1: Extract resume text from PDF
        pdf_bytes = resume_file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        image_count = detect_images_in_pdf(doc)

        for page in doc:
            text += page.get_text()

        print("EXTRACTED TEXT:", text[:500])

        raw_text = text.lower()
        clean_text = re.sub(r"[^\w\s]", " ", raw_text)
        clean_text = re.sub(r"\s+", " ", clean_text).strip()

        # STEP 2: ATS score
        ats_result = calculate_ats_score(raw_text, image_count)
        ats_score = ats_result["ats_score"]
        deductions = ats_result["deductions"]
        suggestions = ats_result["suggestions"]

        
        # STEP 4: Load skills master
        skills_response = supabase.table("skills_master").select("*").execute()
        skills_master = skills_response.data

        # STEP 5: Detect skills
        skills_found = []
        skill_ids = []

        for skill in skills_master:
            original_skill = skill["skill_name"]
            skill_name = original_skill.lower()
            skill_id = skill["skill_id"]

            pattern = r'\b' + re.escape(skill_name) + r'\b'

            if re.search(pattern, clean_text):
                skills_found.append(original_skill)
                skill_ids.append(skill_id)

        skills_found = list(set(skills_found))
        skill_ids = list(set(skill_ids))
         # STEP 3: Save resume
        supabase.table("resume").insert({
            "resume_text": clean_text,
            "user_id": user_id,
            "ats_score": ats_score,
            "extracted_skills": ";".join(skills_found)
        }).execute()

        # STEP 6: Save user skills
        

        # STEP 7: Calculate total experience
        total_experience = extract_experience(clean_text)

        # STEP 8: Fetch job roles from Supabase
        roles_response = supabase.table("job_roles").select("*").execute()
        roles_data = roles_response.data

        # Convert DB fields into proper format
        for role in roles_data:
            role["core_skills"] = [s.strip().lower() for s in (role.get("core_skills") or "").split(",") if s.strip()]
            role["secondary_skills"] = [s.strip().lower() for s in (role.get("secondary_skills") or "").split(",") if s.strip()]
            role["optional_skills"] = [s.strip().lower() for s in (role.get("optional_skills") or "").split(",") if s.strip()]
            role["related_keywords"] = [s.strip().lower() for s in (role.get("related_keywords") or "").split(",") if s.strip()]

        # Run new model
        ml_results = recommend_roles(text, roles_data)        
        print("ML RESULTS:", ml_results)
        # STEP 9: For each predicted role, calculate percentage using:
        # matched skills / total required skills * 100
        career_matches = []

        for item in ml_results:
            role_name = item["role"]

            role_response = supabase.table("job_roles") \
                .select("*") \
                .eq("job_role", role_name) \
                .execute()

            if not role_response.data:
                continue

            role = role_response.data[0]
            role_id = role["role_id"]

            # 🔥 DEFINE SKILL LISTS
            core_list = [s.strip().lower() for s in (role.get("core_skills") or "").split(",") if s.strip()]
            secondary_list = [s.strip().lower() for s in (role.get("secondary_skills") or "").split(",") if s.strip()]
            optional_list = [s.strip().lower() for s in (role.get("optional_skills") or "").split(",") if s.strip()]

            resume_skills = [s.lower() for s in skills_found]

            # 🔥 WEIGHTED SCORING
            score = 0
            max_score = 0

            for skill in core_list:
                max_score += 3
                if skill in resume_skills:
                    score += 3

            for skill in secondary_list:
                max_score += 2
                if skill in resume_skills:
                    score += 2

            for skill in optional_list:
                max_score += 1
                if skill in resume_skills:
                    score += 1

            match_percentage = 0
            if max_score > 0:
                match_percentage = round((score / max_score) * 100, 2)

            # 🔥 BOOST
            match_percentage = min(90, match_percentage * 1.2)

            # 🔥 FINAL SCORE (ML + SKILLS)
            final_score = round((match_percentage * 0.7) + (item["score"] * 0.3), 2)

            # 🔥 APPEND RESULT
            career_matches.append({
                "role": role_name,
                "ml_score": item["score"],
                "skill_score": match_percentage,
                "final_score": final_score,

                "core_skills": core_list,
                "secondary_skills": secondary_list,
                "optional_skills": optional_list,

                "core_matched": [s for s in core_list if s in resume_skills],
                "core_missing": [s for s in core_list if s not in resume_skills],

                "secondary_matched": [s for s in secondary_list if s in resume_skills],
                "secondary_missing": [s for s in secondary_list if s not in resume_skills],

                "optional_matched": [s for s in optional_list if s in resume_skills],
                "optional_missing": [s for s in optional_list if s not in resume_skills],
            })

            # 🔥 STORE SKILL GAP (optional but safe)
            existing_gap = supabase.table("skill_gap") \
                .select("*") \
                .eq("user_id", user_id) \
                .eq("role_id", role_id) \
                .execute()

            if not existing_gap.data:
                supabase.table("skill_gap").insert({
                    "user_id": user_id,
                    "role_id": role_id,
                    "matched_skills": ";".join([s for s in core_list if s in resume_skills]),
                    "missing_skills": ";".join([s for s in core_list if s not in resume_skills]),
                    "gap_score": match_percentage
                }).execute()

        # Sort again by calculated skill percentage
        career_matches = sorted(career_matches, key=lambda x: x["skill_score"], reverse=True)
        
        # STEP 10: Return response
        return Response({
            "skills_found": skills_found,
            "total_experience": total_experience,
            "ats_score": ats_score,
            "deductions": deductions,
            "suggestions": suggestions,
            "careers": career_matches
            
        })
    

    except ModelIntegrationError as e:
        print("ML ERROR:", e)
        return Response({
            "skills_found": [],
            "error": f"ML model error: {str(e)}"
        }, status=503)

    except Exception as e:
        print("ERROR:", e)
        return Response({
            "skills_found": [],
            "error": str(e)
        }, status=500)
    
