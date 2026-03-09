from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .supabase_client import supabase
import pdfplumber
import spacy
import re

nlp = spacy.load("en_core_web_sm")


def extract_experience(text):
    exp_matches = re.findall(r'(\d+(\.\d+)?)\s*(years|yrs)', text.lower())
    total_exp = sum([float(match[0]) for match in exp_matches])
    return total_exp



@parser_classes([MultiPartParser, FormParser])
@api_view(['POST'])

def upload_resume(request):

    print("FILES:", request.FILES)
    print("DATA:", request.data)
    

    resume_file = request.FILES.get("resume")
    user_id = request.data.get("user_id")

    if not resume_file:
        return Response({"message": "No file uploaded"}, status=400)

    text = ""

    try:

        # -----------------------------
        # STEP 1: Extract resume text
        # -----------------------------
        with pdfplumber.open(resume_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "

        text = text.lower()

        # -----------------------------
        # STEP 2: Save resume
        # -----------------------------
        supabase.table("resume").insert({
            "resume_text": text,
            "user_id": user_id
        }).execute()

        # -----------------------------
        # STEP 3: Load skills_master
        # -----------------------------
        skills_response = supabase.table("skills_master").select("*").execute()
        skills_master = skills_response.data

        skills_found = []
        skill_ids = []

        # -----------------------------
        # STEP 4: Detect skills
        # -----------------------------
       

        skills_found = []
        skill_ids = []

        
        for skill in skills_master:

            original_skill = skill["skill_name"]      # Keep original format
            skill_name = original_skill.lower()       # Lowercase for matching
            skill_id = skill["skill_id"]

            # Create exact word match pattern
            pattern = r'\b' + re.escape(skill_name) + r'\b'

            if re.search(pattern, text):

                skills_found.append(original_skill)   # Use original name
                skill_ids.append(skill_id)
        skills_found = list(set(skills_found))
        skill_ids = list(set(skill_ids))

        # -----------------------------
        # STEP 5: Save user_skills
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
        # STEP 6: Calculate experience
        # -----------------------------
        total_experience = extract_experience(text)

        # -----------------------------
        # STEP 7: Load job_roles
        # -----------------------------
        roles_response = supabase.table("job_roles").select("*").execute()
        roles = roles_response.data

        career_matches = []

        # -----------------------------
        # STEP 8: Match careers
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
        # STEP 9: Sort careers
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
        # STEP 10: Return response
        # -----------------------------
        return Response({

            "skills_found": skills_found,
            "total_experience": total_experience,
            "ats_score": 75,
            "careers": career_matches[:5]

        })

    except Exception as e:

        print("ERROR:", e)

        return Response({
            "skills_found": [],
            "error": str(e)
        })