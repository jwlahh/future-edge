from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Resume
import pdfplumber


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
    file = request.FILES.get('resume_file')

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    resume = Resume.objects.create(resume_file=file)

    try:
        with pdfplumber.open(resume.resume_file.path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""

        resume.resume_text = text
        resume.save()

    except Exception as e:
        return Response({"error": str(e)}, status=500)

    return Response({
        "message": "Resume uploaded successfully",
        "resume_id": resume.id,
        "preview": resume.resume_text[:200]
    })
