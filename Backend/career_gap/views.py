from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.supabase_client import supabase
import re


@api_view(['POST'])
def skill_gap(request):

    role_name = request.data.get("role")

    # ✅ Get skills from frontend (current resume only)
    user_skills = request.data.get("skills", [])

    if not role_name:
        return Response({"error": "Role not provided"})

    # -----------------------------
    # Normalize function (🔥 FIX)
    # -----------------------------
    def normalize(text):
        return re.sub(r'[\s\.\-+]', '', text.lower())

    normalized_user_skills = [normalize(u) for u in user_skills]

    # -----------------------------
    # Get job role
    # -----------------------------
    role_response = supabase.table("job_roles") \
        .select("*") \
        .eq("job_role", role_name) \
        .execute()

    if not role_response.data:
        return Response({"error": "Role not found"})

    role = role_response.data[0]

    core = role.get("core_skills", "")
    secondary = role.get("secondary_skills", "")
    optional = role.get("optional_skills", "")

    required_skills = []

    for group in [core, secondary, optional]:
        if group:
            required_skills.extend([s.strip() for s in group.split(",")])

    # -----------------------------
    # Find matched and missing
    # -----------------------------
    matched_skills = []
    missing_skills = []

    for skill in required_skills:
        norm_skill = normalize(skill)

        # 🔥 SMART MATCH (handles variations)
        if any(norm_skill in u or u in norm_skill for u in normalized_user_skills):
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    # -----------------------------
    # Calculate gap score
    # -----------------------------
    gap_score = 0

    if len(required_skills) > 0:
        gap_score = round(
            (len(matched_skills) / len(required_skills)) * 100,
            2
        )

    # -----------------------------
    # Response
    # -----------------------------
    return Response({
        "required_skills": required_skills,

        # 🎯 This is what frontend shows as "Your Skills"
        "user_skills": matched_skills,

        "missing_skills": missing_skills,
        "gap_score": gap_score
    })