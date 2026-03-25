from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .supabase_client import supabase
from core.ats_engine import calculate_ats_score
import fitz  # PyMuPDF
import spacy
import re

nlp = spacy.load("en_core_web_sm")


# -----------------------------
# NEW: spaCy Skill Extraction
# -----------------------------
def extract_skills_spacy(text, skills_master):
    doc = nlp(text)

    full_text = doc.text.lower()

    skills_found = []
    skill_ids = []

    for skill in skills_master:
        skill_name = skill["skill_name"].lower()
        skill_id = skill["skill_id"]

        # Create word-boundary regex (safe match)
        pattern = r'\b' + re.escape(skill_name) + r'\b'

        if re.search(pattern, full_text):
            skills_found.append(skill["skill_name"])
            skill_ids.append(skill_id)

    return list(set(skills_found)), list(set(skill_ids))


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


@parser_classes([MultiPartParser, FormParser])
@api_view(['POST'])
def upload_resume(request):

    resume_file = request.FILES.get("resume")
    user_id = request.data.get("user_id")

    if not resume_file:
        return Response({"message": "No file uploaded"}, status=400)

    text = ""

    try:
        # -----------------------------
        # STEP 1: Extract resume text
        # -----------------------------
        pdf_bytes = resume_file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        image_count = detect_images_in_pdf(doc)

        for page in doc:
            text += page.get_text()

        raw_text = text.lower()

        clean_text = re.sub(r"[^\w\s]", " ", raw_text)
        clean_text = re.sub(r"\s+", " ", clean_text)

        # -----------------------------
        # STEP 2: ATS Score
        # -----------------------------
        ats_result = calculate_ats_score(raw_text, image_count)

        ats_score = ats_result["ats_score"]
        deductions = ats_result["deductions"]
        suggestions = ats_result["suggestions"]

        # -----------------------------
        # STEP 3: Save resume
        # -----------------------------
        supabase.table("resume").insert({
            "resume_text": clean_text,
            "user_id": user_id,
            "ats_score": ats_score
        }).execute()

        # -----------------------------
        # STEP 4: Load skills_master
        # -----------------------------
        skills_response = supabase.table("skills_master").select("*").execute()
        skills_master = skills_response.data

        # -----------------------------
        # STEP 5: Detect skills (UPDATED)
        # -----------------------------
        skills_found, skill_ids = extract_skills_spacy(clean_text, skills_master)

        # -----------------------------
        # STEP 6: Save user_skills
        # -----------------------------
        for skill_id in skill_ids:

            existing = supabase.table("user_skills") \
                .select("*") \
                .eq("user_id", user_id) \
                .eq("skill_id", skill_id) \
                .execute()

            if not existing.data:
                supabase.table("user_skills").insert({
                    "user_id": user_id,
                    "skill_id": skill_id
                }).execute()

        # -----------------------------
        # STEP 7: Experience
        # -----------------------------
        total_experience = extract_experience(clean_text)

        # -----------------------------
        # STEP 8: Load job roles
        # -----------------------------
        roles_response = supabase.table("job_roles").select("*").execute()
        roles = roles_response.data

        career_matches = []

        # -----------------------------
        # STEP 9: Match careers (UNCHANGED)
        # -----------------------------
        for role in roles:

            role_name = role["job_role"]

            required_skills = role["job_skills"].lower().split(";")
            required_skills = [s.strip() for s in required_skills]

            matches = 0

            for skill in skills_found:
                if skill.lower() in required_skills:
                    matches += 1

            score = 0
            if len(required_skills) > 0:
                score = round((matches / len(required_skills)) * 100, 2)

            career_matches.append({
                "role": role_name,
                "score": score
            })

        # -----------------------------
        # STEP 10: Sort careers
        # -----------------------------
        career_matches = sorted(
            career_matches,
            key=lambda x: x["score"],
            reverse=True
        )

        if len(skills_found) == 0:
            return Response({
                "skills_found": [],
                "careers": [],
                "message": "No skills detected in resume"
            })

        # -----------------------------
        # STEP 11: Skill gap (UNCHANGED)
        # -----------------------------
        top_careers = career_matches[:5]

        for career in top_careers:

            role_name = career["role"]

            role_response = supabase.table("job_roles") \
                .select("*") \
                .eq("job_role", role_name) \
                .execute()

            if not role_response.data:
                continue

            role = role_response.data[0]
            role_id = role["role_id"]

            required_skills = role["job_skills"].split(";")
            required_skills = [s.strip() for s in required_skills]

            matched_skills = []
            missing_skills = []

            for skill in required_skills:
                if skill.lower() in [s.lower() for s in skills_found]:
                    matched_skills.append(skill)
                else:
                    missing_skills.append(skill)

            gap_score = 0

            if len(required_skills) > 0:
                gap_score = round(
                    (len(matched_skills) / len(required_skills)) * 100,
                    2
                )

            existing = supabase.table("skill_gap") \
                .select("*") \
                .eq("user_id", user_id) \
                .eq("role_id", role_id) \
                .execute()

            if not existing.data:
                supabase.table("skill_gap").insert({
                    "user_id": user_id,
                    "role_id": role_id,
                    "matched_skills": ";".join(matched_skills),
                    "missing_skills": ";".join(missing_skills),
                    "gap_score": gap_score
                }).execute()

        # -----------------------------
        # STEP 12: Response (UNCHANGED)
        # -----------------------------
        return Response({
            "skills_found": skills_found,
            "total_experience": total_experience,
            "ats_score": ats_score,
            "deductions": deductions,
            "suggestions": suggestions,
            "careers": career_matches[:5]
        })

    except Exception as e:
        print("ERROR:", e)
        return Response({
            "skills_found": [],
            "error": str(e)
        })