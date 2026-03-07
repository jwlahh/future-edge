from django.db import models

class Resume(models.Model):
    resume_file = models.FileField(upload_to='resumes/')
    resume_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume {self.id}"
