from django.urls import path
from .views import skill_gap

urlpatterns = [
    path("skill-gap/", skill_gap)
]