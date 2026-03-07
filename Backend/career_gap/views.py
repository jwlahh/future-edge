from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
import pdfplumber
import spacy
import re

nlp = spacy.load("en_core_web_sm")

KEYWORDS = [
    "python","java","c","c++","sql","machine learning",
    "data science","html","css","django","react","javascript"
]

def extract_skills(text):
    doc = nlp(text.lower())
    return [kw for kw in KEYWORDS if kw in doc.text]

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

    if not resume_file:
        return Response({"message": "No file uploaded"}, status=400)

    text = ""

    try:

        with pdfplumber.open(resume_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "

        skills_found = extract_skills(text)
        total_experience = extract_experience(text)

        return Response({

            "skills_found": skills_found,
            "total_experience": total_experience,

            "ats_score": 75,

            "careers": [
                {"role": "Data Scientist", "score": 82},
                {"role": "Machine Learning Engineer", "score": 70},
                {"role": "Data Analyst", "score": 65}
            ]
        })

    except Exception as e:

        print("PDF ERROR:", e)

        return Response({
            "skills_found": [],
            "error": str(e)
        })