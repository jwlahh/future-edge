import pdfplumber

skills_list = [
    "python",
    "java",
    "c",
    "c++",
    "sql",
    "machine learning",
    "data science",
    "html",
    "css",
    "javascript",
    "django",
    "react"
]

def extract_skills_from_resume(file):
    text = ""

    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            text += page.extract_text()

    text = text.lower()

    found_skills = []

    for skill in skills_list:
        if skill in text:
            found_skills.append(skill)

    return found_skills