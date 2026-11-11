# -*- coding: utf-8 -*-
"""
YojanaSathi AI Brain — ML Inference Microservice
Exposes REST endpoints for real-time 12-class intent classification,
multilingual entity extraction, and end-to-end citizen query analysis.
"""

import sys
import os

# Add ml/src to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from predict import analyze_citizen_query, get_model
from entity_extraction import extract_entities
from language_detection import identify_language

app = FastAPI(
    title="YojanaSathi Multilingual ML Intelligence Service",
    description="Production ML microservice for 12-class citizen intent classification and entity extraction.",
    version="2.1.0"
)

class TextPayload(BaseModel):
    text: str
    language: Optional[str] = "auto"

@app.get("/health")
def health():
    try:
        model = get_model()
        classes = model.get("classes", [])
        return {
            "status": "online",
            "service": "YojanaSathi Multilingual ML Intelligence Engine",
            "model_architecture": model.get("model_name"),
            "intent_classes_count": len(classes),
            "classes": classes,
            "metrics": model.get("metrics")
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }

@app.post("/predict/intent")
def predict_intent_endpoint(payload: TextPayload):
    text = payload.text.strip()
    if not text:
        return {"intent": "GENERAL_WELFARE", "confidence": 0.0, "top_probabilities": {}}
    
    try:
        result = analyze_citizen_query(text)
        return {
            "intent": result["primary_intent"],
            "confidence": result["intent_confidence"],
            "top_probabilities": result["top_probabilities"],
            "language": result["language"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/entities")
def extract_entities_endpoint(payload: TextPayload):
    text = payload.text.strip()
    if not text:
        return {"profile": {}, "confidence": {}, "missing_fields": []}

    try:
        result = extract_entities(text, language=payload.language or "en")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/analyze")
def analyze_endpoint(payload: TextPayload):
    text = payload.text.strip()
    if not text:
        return {
            "language": "en",
            "primary_intent": "GENERAL_WELFARE",
            "intent_confidence": 0.0,
            "extracted_profile": {},
            "missing_information": [],
            "follow_up_question": None
        }

    try:
        return analyze_citizen_query(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("inference_server:app", host="127.0.0.1", port=8000, reload=False)
