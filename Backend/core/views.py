from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .supabase_client import supabase
from core.ats_engine import calculate_ats_score
from core.ml_service import recommend_roles, ModelIntegrationError

import fitz
import re
import json
import random
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_json(file_name):
    path = os.path.join(BASE_DIR, "data", file_name)
    with open(path, "r") as file:
        return json.load(file)

skill_data = {}

data_folder = os.path.join(BASE_DIR, "data")

for file in os.listdir(data_folder):
    if file.endswith(".json"):
        try:
            data = load_json(file)

            file_name_clean = file.replace(".json", "").lower()
            skill_data[file_name_clean] = data

        except Exception as e:
            print("ERROR LOADING:", file, e)

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
        clean_text = re.sub(r"[^\w\s\+#]", " ", raw_text)
        clean_text = re.sub(r"\s+", " ", clean_text).strip()

        # 🔥 normalize variations of c++ and c#
        replacements = {
            "c plus plus": "c++",
            "c + +": "c++",
            "c sharp": "c#",
            "c #": "c#"
        }

        for key, value in replacements.items():
            clean_text = clean_text.replace(key, value)

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

            if skill_name in clean_text:
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
        career_matches = sorted(career_matches, key=lambda x: x["final_score"], reverse=True)
        
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

#-----------------------------
# MOCK ASSESSMENT APIs
# -----------------------------

def get_skills_for_role(role_name):
    try:
        response = supabase.table("job_roles") \
            .select("core_skills, secondary_skills, optional_skills") \
            .eq("job_role", role_name) \
            .execute()

        if not response.data:
            return None

        role = response.data[0]

        core = role.get("core_skills", "")
        secondary = role.get("secondary_skills", "")
        optional = role.get("optional_skills", "")

        skills = []

        for group in [core, secondary, optional]:
            if group:
                skills.extend([s.strip() for s in group.split(",")])

        return skills

    except Exception as e:
        print("Error fetching skills:", e)
        return None

def get_assessment(request, role):
    skills = get_skills_for_role(role)

    if not skills:
        return JsonResponse({"error": "Invalid role"}, status=400)

    all_questions = []

    for skill in skills:
        normalized_skill = skill.lower().replace(" ", "_").replace("-", "_")

        print("SKILL:", skill)
        print("LOOKING FOR:", normalized_skill)
        print("AVAILABLE:", skill_data.keys())

        data = skill_data.get(normalized_skill)

        if data:
            all_questions.extend(data.get("mcqs", []))
            all_questions.extend(data.get("coding_mcqs", []))

    # ✅ FIX: fallback if no questions found
    if not all_questions:
        print("⚠️ No questions found, using fallback dataset")

        for key in skill_data:
            data = skill_data[key]
            all_questions.extend(data.get("mcqs", []))
            all_questions.extend(data.get("coding_mcqs", []))

    random.shuffle(all_questions)

    return JsonResponse(all_questions[:30], safe=False)


@csrf_exempt
def submit_assessment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get("user_id")
        time_taken = data.get("time_taken")
        assessment_type = data.get("assessment_type")
        user_answers = data.get("answers", [])
        role = data.get("role")

        if assessment_type == "online":
            score = data.get("score")  # send from frontend

            supabase.table("assessment").insert({
                "role_id": None,
                "assessment_type": "online",
                "score": score,
                "user_id": user_id,
                "time_taken": time_taken
            }).execute()

            return JsonResponse({
                "score": score,
                "total": len(data.get("answers", []))
            })

        # Get skills for selected role
        skills = []

        if assessment_type == "skill":
            skills = get_skills_for_role(role)

            if not skills:
                return JsonResponse({"error": "Invalid role"}, status=400)
        all_questions = []

        if assessment_type == "skill":
            for skill in skills:
                normalized_skill = skill.lower().replace(" ", "_")
                dataset = skill_data.get(normalized_skill)

                if dataset:
                    all_questions.extend(dataset.get("mcqs", []))
                    all_questions.extend(dataset.get("coding_mcqs", []))
                # Debug (optional but useful)
                
        

        score = 0

        # Create quick lookup
        question_map = {q["id"]: q for q in all_questions}

        for ans in user_answers:
            q = question_map.get(ans.get("id"))

            if not q:
                
                continue

            if q.get("correct_answer", "").strip().lower() == ans.get("answer", "").strip().lower():
                score += 1
        
        role_id = None
        
        

        # ✅ Only fetch role_id for skill assessment
        if assessment_type == "skill":
            role_response = supabase.table("job_roles") \
                .select("role_id") \
                .eq("job_role", role) \
                .execute()

            role_id = role_response.data[0]["role_id"] if role_response.data else None

        # ✅ Insert into DB
        supabase.table("assessment").insert({
            "role_id": role_id,  # NULL for online assessment
            "assessment_type": assessment_type,
            "score": score,
            "user_id": user_id,
            "time_taken": time_taken
        }).execute()
        return JsonResponse({
            "score": score,
            "total": len(user_answers)
        })
    
