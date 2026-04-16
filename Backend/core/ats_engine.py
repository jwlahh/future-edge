import re

def calculate_ats_score(text, image_count=0):

    score = 100
    deductions = []
    suggestions = []

    text_lower = text.lower()

    # ---------------------
    # Skills Section
    # ---------------------
    if "skills" not in text_lower:
        score -= 15
        deductions.append("Skills section missing (-15)")
        suggestions.append("Add a dedicated Skills section listing your technical skills")

    # ---------------------
    # Experience
    # ---------------------
    if "experience" not in text_lower and "work experience" not in text_lower:
        score -= 15
        deductions.append("Experience section missing (-15)")
        suggestions.append("Add work experience or internships")

    # ---------------------
    # Education
    # ---------------------
    if "education" not in text_lower:
        score -= 10
        deductions.append("Education section missing (-10)")
        suggestions.append("Add an Education section")

    # ---------------------
    # Email
    # ---------------------
    email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"

    if not re.search(email_pattern, text):
        score -= 10
        deductions.append("Email not detected (-10)")
        suggestions.append("Add a professional email address")

    # ---------------------
    # Phone
    # ---------------------
    phone_pattern = r"\b\d{10}\b"

    if not re.search(phone_pattern, text):
        score -= 10
        deductions.append("Phone number missing (-10)")
        suggestions.append("Add a phone number")

    # ---------------------
    # LinkedIn
    # ---------------------
    if "linkedin.com" not in text_lower:
        score -= 5
        deductions.append("LinkedIn profile missing (-5)")
        suggestions.append("Include your LinkedIn profile URL")

    # ---------------------
    # Resume Length
    # ---------------------
    if len(text) < 300:
        score -= 10
        deductions.append("Resume too short (-10)")
        suggestions.append("Add more details about projects or experience")

    # ---------------------
    # Bullet Points
    # ---------------------
    if "•" not in text and "-" not in text:
        score -= 10
        deductions.append("Bullet points not detected (-10)")
        suggestions.append("Use bullet points to describe achievements")

    # ---------------------
    # Image Detection
    # ---------------------
    if image_count > 0:
        score -= 10
        deductions.append("Images detected in resume (-10)")
        suggestions.append("Remove profile photos or graphics for better ATS compatibility")

    # ---------------------
    # Contact Section
    # ---------------------
    if "contact" not in text_lower:
        score -= 5
        deductions.append("Contact section missing (-5)")
        suggestions.append("Add a Contact Information section")

    score = max(score, 0)
    # ---------------------
    # Vague Content Detection
    # ---------------------
    vague_words = ["some work", "helped team", "did work", "things", "everything", "maybe"]

    vague_count = sum(1 for word in vague_words if word in text_lower)

    if vague_count > 0:
        penalty = min(vague_count * 5, 20)
        score -= penalty
        deductions.append(f"Vague content detected (-{penalty})")
        suggestions.append("Use specific, measurable achievements instead of vague phrases")
    # ---------------------
    # Weak Skills Detection
    # ---------------------
    weak_words = ["maybe", "basic", "everything"]

    if any(word in text_lower for word in weak_words):
        score -= 10
        deductions.append("Weak or unclear skills listed (-10)")
        suggestions.append("List clear and confident skills (e.g., Python, React, SQL)")

    # ---------------------
    # Email validation Detection
    # ---------------------
    
    if not re.search(email_pattern, text) or "gmail" in text_lower and ".com" not in text_lower:
        score -= 10
        deductions.append("Invalid or incomplete email (-10)")
        suggestions.append("Use a proper email like name@gmail.com")

    # ---------------------
    # Repetition Detection
    # ---------------------
    words = text_lower.split()
    repeated = len(words) - len(set(words))

    if repeated > 50:
        score -= 5
        deductions.append("Too much repetition (-5)")
        suggestions.append("Avoid repeating the same words excessively")

    return {
        "ats_score": score,
        "deductions": deductions,
        "suggestions": suggestions
    }

    