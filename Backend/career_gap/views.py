from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.supabase_client import supabase


@api_view(['POST'])
def skill_gap(request):

    user_id = request.data.get("user_id")
    role_name = request.data.get("role")

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

    required_skills = role["job_skills"].split(";")
    required_skills = [s.strip() for s in required_skills]

    # -----------------------------
    # Get user skill IDs
    # -----------------------------
    user_skills_response = supabase.table("user_skills") \
        .select("skill_id") \
        .eq("user_id", user_id) \
        .execute()

    user_skill_ids = [s["skill_id"] for s in user_skills_response.data]

    # -----------------------------
    # Convert skill IDs to names
    # -----------------------------
    skills_response = supabase.table("skills_master") \
        .select("*") \
        .execute()

    skills_master = skills_response.data

    user_skill_names = [
        s["skill_name"]
        for s in skills_master
        if s["skill_id"] in user_skill_ids
    ]

    # -----------------------------
    # Find matched and missing
    # -----------------------------
    matched_skills = []
    missing_skills = []

    for skill in required_skills:

        if skill.lower() in [u.lower() for u in user_skill_names]:
            matched_skills.append(skill)

        else:
            missing_skills.append(skill)

    return Response({

        "required_skills": required_skills,
        "user_skills": matched_skills,
        "missing_skills": missing_skills

    })