import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

class ModelIntegrationError(Exception):
    pass


def clean_text(text: str) -> str:
    if not isinstance(text, str):
        raise ModelIntegrationError("resume_text must be a string")

    text = text.lower()
    text = text.replace("ml", "machine learning")
    text = text.replace("ai", "artificial intelligence")
    text = text.replace("dl", "deep learning")
    text = text.replace("nlp", "natural language processing")
    text = text.replace("cv", "computer vision")
    text = text.replace("js", "javascript")
    text = text.replace("db", "database")

    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text
##---------------extracts sections from the resume-----------##
def extract_sections(text):
    text = text.lower()

    sections = {
        "skills": "",
        "projects": "",
        "experience": "",
        "interests": ""
    }

    current = None

    for line in text.split("\n"):
        if "skill" in line:
            current = "skills"
        elif "project" in line:
            current = "projects"
        elif "experience" in line:
            current = "experience"
        elif "interest" in line:
            current = "interests"

        if current:
            sections[current] += " " + line

    return sections

#----------------extract skills from each section---------------#

def extract_skills(sections, all_skills):
    skill_map = {}

    for section, text in sections.items():
        for skill in all_skills:
            if skill in text:
                if skill not in skill_map:
                    skill_map[skill] = []
                skill_map[skill].append(section)

    return skill_map
#----------------weightage for each section----------------
section_weights = {
    "experience": 1.2,
    "skills": 1.0,
    "projects": 0.8,
    "interests": 0.4
}
#----------------scoreing function-------------------------
def compute_skill_score(role, skill_map):
    score = 0
    max_score = 0

    # Core skills
    for skill in role["core_skills"]:
        max_score += 3 * 1.2
        if skill in skill_map:
            for sec in skill_map[skill]:
                score += 3 * section_weights[sec]

    # Secondary skills
    for skill in role["secondary_skills"]:
        max_score += 2 * 1.2
        if skill in skill_map:
            for sec in skill_map[skill]:
                score += 2 * section_weights[sec]

    # Optional skills
    for skill in role["optional_skills"]:
        max_score += 1 * 1.2
        if skill in skill_map:
            for sec in skill_map[skill]:
                score += 1 * section_weights[sec]

    return score, max_score

def compute_context_score(role, sections):
    text = sections["projects"] + " " + sections["experience"]

    matches = 0

    for keyword in role["related_keywords"]:
        if keyword in text:
            matches += 1

    if len(role["related_keywords"]) == 0:
        return 0

    return matches / len(role["related_keywords"])
def compute_ml_score(resume_text, role):
    role_text = " ".join(
        role["core_skills"] +
        role["secondary_skills"] +
        role["related_keywords"] +
        [str(role["description"])]
    )

    emb1 = model.encode([resume_text])
    emb2 = model.encode([role_text])

    similarity = cosine_similarity(emb1, emb2)[0][0]

    return similarity

def compute_final_score(skill_score, max_score, context_score, ml_score):
    skill_norm = skill_score / max_score if max_score != 0 else 0

    final_score = (
        skill_norm * 0.75 +
        context_score * 0.15 +
        ml_score * 0.30
    )

    return final_score

#-----------------MAIN FUNCTION---------------

def recommend_roles(resume_text, roles_data):

    resume_text = clean_text(resume_text)

    sections = extract_sections(resume_text)

    # collect all skills
    all_skills = set()
    for role in roles_data:
        all_skills.update(role["core_skills"])
        all_skills.update(role["secondary_skills"])
        all_skills.update(role["optional_skills"])

    skill_map = extract_skills(sections, all_skills)

    results = []

    for role in roles_data:

        skill_score, max_score = compute_skill_score(role, skill_map)
        context_score = compute_context_score(role, sections)
        ml_score = compute_ml_score(resume_text, role)

        final_score = compute_final_score(
            skill_score, max_score,
            context_score, ml_score
        )

        results.append({
            "role": role["job_role"],
            "score": round(final_score * 100, 2)
        })

    results = sorted(results, key=lambda x: x["score"], reverse=True)

    return results[:5]