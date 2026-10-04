"""
Centralized Configuration & LLM Provider for Autopilot.
Loads environment variables from .env.local, .env.autopilot, and process environment.
Provides zero-cost multi-model LLM generation with automatic fallbacks.
"""

import os
import json
import logging
import sys
from pathlib import Path
from typing import Optional, Dict, Any, List
import requests
from dotenv import load_dotenv

# Setup Logging (explicit stdout for clean Windows PowerShell execution)
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("autopilot.config")

# Project Root
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent

# Load .env files in priority order
load_dotenv(WORKSPACE_ROOT / ".env.autopilot")
load_dotenv(WORKSPACE_ROOT / ".env.local")
load_dotenv(WORKSPACE_ROOT / ".env")

# ── API Keys ─────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# Firebase Firestore
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "anvitam-e8987")
FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")
FIREBASE_PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY")

# Resend Email
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Buffer (Unified 1-Token Multi-Platform Publishing)
BUFFER_ACCESS_TOKEN = os.getenv("BUFFER_ACCESS_TOKEN")

# Social Platforms (Native APIs)
BLUESKY_HANDLE = os.getenv("BLUESKY_HANDLE")
BLUESKY_APP_PASSWORD = os.getenv("BLUESKY_APP_PASSWORD")

MASTODON_INSTANCE_URL = os.getenv("MASTODON_INSTANCE_URL", "https://mastodon.social")
MASTODON_ACCESS_TOKEN = os.getenv("MASTODON_ACCESS_TOKEN")

THREADS_ACCESS_TOKEN = os.getenv("THREADS_ACCESS_TOKEN")
THREADS_USER_ID = os.getenv("THREADS_USER_ID")

TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET")
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")

LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")
LINKEDIN_AUTHOR_URN = os.getenv("LINKEDIN_AUTHOR_URN")

MEDIUM_INTEGRATION_TOKEN = os.getenv("MEDIUM_INTEGRATION_TOKEN")
MEDIUM_USER_ID = os.getenv("MEDIUM_USER_ID")

SUBSTACK_EMAIL = os.getenv("SUBSTACK_EMAIL")
SUBSTACK_PASSWORD = os.getenv("SUBSTACK_PASSWORD")
SUBSTACK_PUBLICATION_URL = os.getenv("SUBSTACK_PUBLICATION_URL", "https://anvitam.substack.com")

SITE_BASE_URL = os.getenv("SITE_BASE_URL", "https://www.anvitam.com")
BLOG_SAVE_AS_DRAFT = os.getenv("BLOG_SAVE_AS_DRAFT", "true").lower() == "true"


# ── Robust Multi-Provider LLM Engine ─────────────────────────────────────────

def call_nvidia_nim(
    prompt: str,
    system_instruction: Optional[str] = None,
    json_mode: bool = False,
    model: str = "nvidia/llama-3.1-nemotron-70b-instruct"
) -> Optional[str]:
    """Call NVIDIA NIM OpenAI-compatible API."""
    if not NVIDIA_API_KEY:
        return None
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.2 if json_mode else 0.7,
        "max_tokens": 4096
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    try:
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        if res.status_code == 200:
            data = res.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.warning(f"NVIDIA NIM call failed: {e}")
    return None


def call_openrouter(
    prompt: str,
    system_instruction: Optional[str] = None,
    json_mode: bool = False,
    model: str = "meta-llama/llama-3.3-70b-instruct"
) -> Optional[str]:
    """Call OpenRouter OpenAI-compatible API."""
    if not OPENROUTER_API_KEY:
        return None
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    models_to_try = [model, "deepseek/deepseek-chat"]
    for m in models_to_try:
        payload = {
            "model": m,
            "messages": messages,
            "temperature": 0.2 if json_mode else 0.7,
            "max_tokens": 3000
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            res = requests.post(url, headers=headers, json=payload, timeout=60)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
            else:
                logger.warning(f"OpenRouter ({m}) error {res.status_code}: {res.text[:150]}")
        except Exception as e:
            logger.warning(f"OpenRouter call failed for {m}: {e}")
    return None


def call_groq(
    prompt: str,
    system_instruction: Optional[str] = None,
    json_mode: bool = False,
    model: str = "llama-3.3-70b-versatile"
) -> Optional[str]:
    """Call Groq API."""
    if not GROQ_API_KEY:
        return None
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.2 if json_mode else 0.7,
        "max_tokens": 4096
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    try:
        res = requests.post(url, headers=headers, json=payload, timeout=60)
        if res.status_code == 200:
            data = res.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.warning(f"Groq call failed: {e}")
    return None


def generate_llm_response(
    prompt: str,
    system_instruction: Optional[str] = None,
    json_mode: bool = False
) -> str:
    """
    Generate response with fallback across free tier models:
    1. NVIDIA NIM (Llama 3.3 70B)
    2. OpenRouter (Gemini 2.0 Flash)
    3. Groq (Llama 3.3 70B)
    """
    # 1. Try NVIDIA NIM
    result = call_nvidia_nim(prompt, system_instruction, json_mode)
    if result:
        return result.strip()

    # 2. Try OpenRouter
    result = call_openrouter(prompt, system_instruction, json_mode)
    if result:
        return result.strip()

    # 3. Try Groq
    result = call_groq(prompt, system_instruction, json_mode)
    if result:
        return result.strip()

    raise RuntimeError("All LLM providers failed. Check your API keys in .env.local.")
