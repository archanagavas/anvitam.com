"""
Autonomous Multi-Model Image Generator for Anvitam Autopilot.
Generates photorealistic architectural, permaculture, and interior images at $0 cost.
Supports:
1. Google Gemini (Imagen 3 / gemini-2.0-flash via GEMINI_API_KEY)
2. Hugging Face Serverless (FLUX.1-schnell via HUGGINGFACE_API_KEY)
3. Pollinations.ai (High-speed zero-auth fallback)
"""

import os
import io
import time
import urllib.parse
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import requests

from autopilot.config import (
    GEMINI_API_KEY,
    HUGGINGFACE_API_KEY,
    WORKSPACE_ROOT,
    logger
)

IMAGE_DIR = WORKSPACE_ROOT / "autopilot" / "published_records" / "images"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)


def generate_flux_huggingface(prompt: str, filename: str) -> Optional[str]:
    """Generates image via Hugging Face Serverless FLUX.1-schnell."""
    if not HUGGINGFACE_API_KEY:
        return None
    url = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    payload = {"inputs": prompt}

    try:
        res = requests.post(url, headers=headers, json=payload, timeout=45)
        if res.status_code == 200 and len(res.content) > 5000:
            local_path = IMAGE_DIR / filename
            with open(local_path, "wb") as f:
                f.write(res.content)
            logger.info(f"✔ FLUX.1 Image generated successfully: {local_path.name}")
            return str(local_path)
    except Exception as e:
        logger.warning(f"HuggingFace FLUX generation failed: {e}")
    return None


def generate_gemini_image(prompt: str, filename: str) -> Optional[str]:
    """Generates image via Google Gemini Imagen 3 API if enabled."""
    if not GEMINI_API_KEY:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "16:9",
            "outputMimeType": "image/jpeg"
        }
    }
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=60)
        if res.status_code == 200:
            data = res.json()
            predictions = data.get("predictions", [])
            if predictions and "bytesBase64Encoded" in predictions[0]:
                import base64
                img_data = base64.b64decode(predictions[0]["bytesBase64Encoded"])
                local_path = IMAGE_DIR / filename
                with open(local_path, "wb") as f:
                    f.write(img_data)
                logger.info(f"✔ Gemini Imagen 3 generated: {local_path.name}")
                return str(local_path)
    except Exception as e:
        logger.warning(f"Gemini Imagen API call failed: {e}")
    return None


def generate_pollinations_image(prompt: str, filename: str, width: int = 1280, height: int = 720) -> str:
    """Zero-auth fallback generating photorealistic FLUX images via Pollinations.ai."""
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&model=flux&nologo=true&enhance=true"
    local_path = IMAGE_DIR / filename

    try:
        res = requests.get(url, timeout=45)
        if res.status_code == 200 and len(res.content) > 5000:
            with open(local_path, "wb") as f:
                f.write(res.content)
            logger.info(f"✔ Pollinations FLUX image saved: {local_path.name}")
            return str(local_path)
    except Exception as e:
        logger.warning(f"Pollinations generation failed: {e}")
    
    # Return direct CDN URL as guaranteed fallback
    return url


def generate_architectural_image(
    concept: str,
    aspect_ratio: str = "16:9",
    image_type: str = "blog_cover"
) -> Dict[str, Any]:
    """
    Master entrypoint to generate high-end architectural and permaculture imagery.
    Returns dict with local_path and direct_url.
    """
    clean_concept = concept.replace('"', '').replace("'", "")
    timestamp = int(time.time())
    filename = f"anvitam_{image_type}_{timestamp}.jpg"

    # Refined prompt presets
    if "pool" in concept.lower() or "water" in concept.lower():
        prompt = (
            f"Photorealistic luxury biological living swimming pool surrounded by lush natural reed beds, "
            f"smooth river stones, crystal clear filtered water, biophilic wooden deck, warm sunlight, "
            f"modern architectural villa in background, Architectural Digest photography, Hasselblad 50mm, 8k -- {clean_concept}"
        )
    elif "permaculture" in concept.lower() or "land" in concept.lower() or "farm" in concept.lower():
        prompt = (
            f"Breathtaking 10-acre regenerative permaculture estate with tiered swales, lush food forest canopy, "
            f"stone walking pathways, off-grid rammed earth retreat cottage, golden hour morning light, "
            f"National Geographic editorial landscape style, hyper-detailed, 8k -- {clean_concept}"
        )
    else:
        prompt = (
            f"Award-winning modern sustainable rammed earth villa with natural lime plaster, deep 1.8m timber eaves, "
            f"indoor-outdoor courtyard garden, passive cooled biophilic architecture, warm ambient architectural lighting, "
            f"Dwell magazine cover style, crisp textures, Hasselblad H6D-100c, 8k -- {clean_concept}"
        )

    # 1. Try Gemini Imagen 3
    img_path = generate_gemini_image(prompt, filename)
    if img_path:
        encoded_prompt = urllib.parse.quote(prompt)
        direct_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&model=flux&nologo=true"
        return {"local_path": img_path, "direct_url": direct_url, "prompt": prompt, "source": "gemini_imagen"}

    # 2. Try Hugging Face FLUX.1
    img_path = generate_flux_huggingface(prompt, filename)
    if img_path:
        encoded_prompt = urllib.parse.quote(prompt)
        direct_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&model=flux&nologo=true"
        return {"local_path": img_path, "direct_url": direct_url, "prompt": prompt, "source": "huggingface_flux"}

    # 3. Fast Pollinations FLUX fallback
    width, height = (1280, 720) if aspect_ratio == "16:9" else (1080, 1080)
    encoded_prompt = urllib.parse.quote(prompt)
    direct_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&model=flux&nologo=true&enhance=true"
    img_path = generate_pollinations_image(prompt, filename, width=width, height=height)
    return {"local_path": img_path, "direct_url": direct_url, "prompt": prompt, "source": "pollinations_flux"}
