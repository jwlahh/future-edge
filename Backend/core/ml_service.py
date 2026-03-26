import pickle
import re
import warnings
from pathlib import Path

from sklearn.exceptions import InconsistentVersionWarning


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "career_model.pkl"
VECTORIZER_PATH = BASE_DIR / "vectorizer.pkl"

BLOCKED_LABELS = {"Category"}


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


class CareerRecommendationMLService:
    _instance = None

    def __init__(self):
        self.model = None
        self.vectorizer = None
        self._load()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load(self):
        if not MODEL_PATH.exists():
            raise ModelIntegrationError(f"Missing model file: {MODEL_PATH}")

        if not VECTORIZER_PATH.exists():
            raise ModelIntegrationError(f"Missing vectorizer file: {VECTORIZER_PATH}")

        with warnings.catch_warnings():
            warnings.simplefilter("error", InconsistentVersionWarning)
            try:
                with open(MODEL_PATH, "rb") as f:
                    self.model = pickle.load(f)

                with open(VECTORIZER_PATH, "rb") as f:
                    self.vectorizer = pickle.load(f)

            except InconsistentVersionWarning:
                raise ModelIntegrationError(
                    "Scikit-learn version mismatch. Use the same version used during training."
                )

        if not hasattr(self.model, "classes_"):
            raise ModelIntegrationError("Invalid model file")

    def predict(self, resume_text: str, k: int = 5):
        processed_text = clean_text(resume_text)

        if not processed_text:
            raise ModelIntegrationError("Resume text is empty after cleaning")

        vectorized_text = self.vectorizer.transform([processed_text])

        if hasattr(self.model, "predict_proba"):
            scores = self.model.predict_proba(vectorized_text)[0]
        elif hasattr(self.model, "decision_function"):
            scores = self.model.decision_function(vectorized_text)[0]
        else:
            raise ModelIntegrationError("Model does not support prediction scoring")

        top_indices = scores.argsort()[-k:][::-1]

        predictions = []
        for i in top_indices:
            label = str(self.model.classes_[i])

            if label in BLOCKED_LABELS:
                continue

            import random

            raw_score = float(scores[i])

            # Convert to percentage if needed
            if 0 <= raw_score <= 1:
                raw_score = raw_score * 100

            # 🎯 VISUAL MAPPING (your requirement)
            if raw_score >= 55:
                display_score = 75 + (raw_score - 55) * (15 / 45)   # 75 → 90
            elif raw_score >= 30:
                display_score = 60 + (raw_score - 30) * (15 / 25)   # 60 → 75
            else:
                display_score = 40 + (raw_score * (20 / 30))        # 40 → 60

            # ✨ Add slight natural variation
            display_score += random.uniform(-1.5, 1.5)

            # 🔒 Clamp between 40 and 90
            display_score = max(40, min(display_score, 90))

            # 🎯 Final rounded score
            score = round(display_score, 2)

            predictions.append({
                "label": label,
                "score": score
            })

        if not predictions:
            raise ModelIntegrationError("No valid predictions found")

        return {
            "top_prediction": predictions[0]["label"],
            "predictions": predictions
        }