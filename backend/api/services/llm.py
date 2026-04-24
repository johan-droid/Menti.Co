"""
LLM summarization service.
Uses async HTTP to avoid blocking the event loop.
"""
import logging
import httpx
from typing import List

from config import settings

logger = logging.getLogger(__name__)

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "want to die", "end my life",
    "harm myself", "end it all", "self harm", "cut myself",
]

CRISIS_RESOURCES = {
    "message": (
        "You mentioned something that sounds like you might be in distress. "
        "If you are in crisis, please reach out to a mental health emergency "
        "service immediately. This site provides research papers for informational "
        "purposes and cannot provide professional support."
    ),
    "crisis_resources": [
        "🇮🇳 India: KIRAN Mental Health Helpline – 1800-599-0019",
        "🇺🇸 US: 988 Suicide & Crisis Lifeline – call or text 988",
        "🇬🇧 UK: Samaritans – 116 123",
        "🌍 Find a local helpline at befrienders.org",
    ],
    "is_crisis": True,
}


def detect_crisis(text: str) -> bool:
    """Check if user input contains crisis keywords."""
    lower = text.lower()
    return any(keyword in lower for keyword in CRISIS_KEYWORDS)


async def generate_summary(query: str, papers: List[dict], view_type: str) -> str:
    """Generate an LLM summary of research papers. Fully async."""
    context = "\n\n".join(
        [f"Paper: {p['title']}\nAbstract: {p['abstract_snippet']}" for p in papers]
    )

    if view_type == "patient":
        system_prompt = (
            "You are an empathetic mental health research assistant. Explain research "
            "findings to a patient in simple, hopeful, and jargon-free language. "
            "Focus on practical insights and themes. Always include a disclaimer that "
            "this is not medical advice. Never diagnose the user. "
            "Use 'Research suggests...' or 'Studies show...'"
        )
    else:
        system_prompt = (
            "You are a clinical research consultant. Provide a technical, evidence-based "
            "summary for a medical professional. Focus on treatment modalities, statistical "
            "significance, and specific findings. Maintain a technical, professional tone."
        )

    prompt = f"User Query: {query}\n\nTop Research Papers Found:\n{context}\n\nSummary:"

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.MODEL_NAME,
                    "prompt": prompt,
                    "system": system_prompt,
                    "stream": False,
                },
            )
            return response.json().get(
                "response",
                "I'm sorry, I couldn't generate a summary at this time.",
            )
    except httpx.TimeoutException:
        logger.warning("LLM request timed out for query: %s", query[:100])
        return "Summary service timed out. Please try again."
    except Exception as e:
        logger.error("LLM summary failed: %s", e)
        return "Summary service temporarily unavailable."
