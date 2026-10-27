"""
Autonomous Architectural Image Generator for Anvitam Autopilot.
Generates and serves premium architectural, permaculture, and interior images.
No third-party watermark image services are used anywhere in this pipeline.

Priority Sequence:
1. Google Gemini Generative Image API (gemini-2.5-flash-image, gemini-3.1-flash-image, Imagen 3)
2. Hugging Face Serverless FLUX.1 / SDXL (router.huggingface.co)
3. Dynamic Architectural Engine (Wikimedia Commons API - high-res, authentic, CC/public domain)
4. Curated Anvitam Studio Asset Library (autopilot/assets/studio_library/)
5. Permanent Cloudinary CDN Hosting (Cloud Name: voef9roi)
"""

import os
import io
import sys
import time
import base64
import random
import logging
import re
from pathlib import Path
from typing import Optional, Dict, Any, List
import requests

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from autopilot.config import (
    GEMINI_API_KEY,
    HUGGINGFACE_API_KEY,
    WORKSPACE_ROOT,
    logger
)

IMAGE_DIR = WORKSPACE_ROOT / "autopilot" / "published_records" / "images"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

STUDIO_LIBRARY_DIR = WORKSPACE_ROOT / "autopilot" / "assets" / "studio_library"
STUDIO_LIBRARY_DIR.mkdir(parents=True, exist_ok=True)

# Cloudinary CDN Configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "voef9roi")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

_cloudinary_configured = False
if CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True
        )
        _cloudinary_configured = True
        logger.info("✔ Cloudinary CDN initialized for publication-grade image hosting.")
    except Exception as ce:
        logger.warning(f"Cloudinary configuration note: {ce}")


def upload_to_cloudinary(local_path: str, public_id: Optional[str] = None) -> Optional[str]:
    """Uploads local image to Cloudinary CDN for instant, permanent, unblocked social delivery."""
    if not _cloudinary_configured or not os.path.exists(local_path):
        return None
    try:
        import cloudinary.uploader
        clean_id = public_id or Path(local_path).stem
        res = cloudinary.uploader.upload(
            local_path,
            public_id=clean_id,
            overwrite=True,
            resource_type="image"
        )
        secure_url = res.get("secure_url")
        if secure_url:
            logger.info(f"✔ Image uploaded to Cloudinary CDN: {secure_url}")
            return secure_url
    except Exception as e:
        logger.warning(f"Cloudinary upload failed for {local_path}: {e}")
    return None


def generate_gemini_image(prompt: str, filename: str) -> Optional[str]:
    """
    Generates photorealistic architectural sketch via Google Gemini Imagen / Image API.
    Attempts multiple Gemini image generation model endpoints.
    """
    if not GEMINI_API_KEY:
        return None

    # 1. Try Gemini Image Generation via generateContent
    for model_name in [
        "gemini-2.5-flash-image",
        "gemini-3.1-flash-image",
        "gemini-3-pro-image",
        "gemini-3.1-flash-lite-image"
    ]:
        gen_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        gen_payload = {
            "contents": [{
                "parts": [{"text": f"Generate an image: {prompt}"}]
            }],
            "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
        }
        try:
            res = requests.post(gen_url, headers=headers, json=gen_payload, timeout=30)
            if res.status_code == 429:
                logger.warning(
                    f"⚠ Gemini image quota exceeded (429) on {model_name}. "
                    "Image generation needs Gemini API billing/quota: check https://ai.dev/rate-limit "
                    "and enable billing for this API key, or the pipeline will use fallback imagery."
                )
            elif res.status_code != 200:
                logger.warning(f"Gemini image {model_name} returned HTTP {res.status_code}: {res.text[:160]}")
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    for part in parts:
                        inline_data = part.get("inlineData") or part.get("inline_data")
                        if inline_data and "data" in inline_data:
                            img_data = base64.b64decode(inline_data["data"])
                            local_path = IMAGE_DIR / filename
                            with open(local_path, "wb") as f:
                                f.write(img_data)
                            logger.info(f"✔ Gemini Image ({model_name}) generated: {local_path.name}")
                            return str(local_path)
        except Exception as e:
            logger.debug(f"Gemini {model_name} call note: {e}")

    # 2. Try Imagen 3 Predict endpoint with x-goog-api-key
    predict_url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "16:9",
            "outputMimeType": "image/jpeg"
        }
    }
    try:
        res = requests.post(predict_url, headers=headers, json=payload, timeout=30)
        if res.status_code == 200:
            data = res.json()
            predictions = data.get("predictions", [])
            if predictions and "bytesBase64Encoded" in predictions[0]:
                img_data = base64.b64decode(predictions[0]["bytesBase64Encoded"])
                local_path = IMAGE_DIR / filename
                with open(local_path, "wb") as f:
                    f.write(img_data)
                logger.info(f"✔ Gemini Imagen 3 generated: {local_path.name}")
                return str(local_path)
    except Exception as e:
        logger.debug(f"Gemini Imagen predict endpoint note: {e}")

    return None


def generate_hf_image(prompt: str, filename: str) -> Optional[str]:
    """
    Generates high-resolution architectural image via Hugging Face Serverless Inference API (FLUX.1 / SDXL).
    Zero watermarks, high precision.
    """
    if not HUGGINGFACE_API_KEY:
        return None

    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    models = [
        "black-forest-labs/FLUX.1-schnell",
        "stabilityai/stable-diffusion-xl-base-1.0"
    ]
    for model in models:
        url = f"https://router.huggingface.co/hf-inference/models/{model}"
        payload = {"inputs": prompt}
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=40)
            if res.status_code != 200:
                logger.warning(f"HuggingFace image {model} returned HTTP {res.status_code}: {res.text[:160]}")
            if res.status_code == 200 and "image" in res.headers.get("content-type", "").lower():
                local_path = IMAGE_DIR / filename
                with open(local_path, "wb") as f:
                    f.write(res.content)
                logger.info(f"✔ HuggingFace ({model}) generated: {local_path.name}")
                return str(local_path)
        except Exception as e:
            logger.debug(f"HuggingFace {model} call note: {e}")

    return None


def generate_dynamic_architectural_image(concept: str, filename: str) -> Optional[str]:
    """
    Fetches an authentic, high-resolution architectural/landscape photograph from
    Wikimedia Commons matching the topic. Completely free, public domain / CC, ZERO watermark.
    """
    # Extract search terms from concept
    words = [w for w in re.findall(r'[a-zA-Z]{3,}', concept.lower()) if w not in {
        'the', 'and', 'for', 'with', 'from', 'best', 'real', 'how', 'what', 'when',
        'talk', 'numbers', 'about', 'contractors', 'love', 'empirical', 'metrics'
    }]
    search_term = " ".join(words[:4]) or "courtyard garden architecture"

    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": search_term,
        "gsrnamespace": 6,
        "gsrlimit": 8,
        "prop": "imageinfo",
        "iiprop": "url|size|mime"
    }
    headers = {"User-Agent": "AnvitamArchitectureBot/1.0 (anvitamarchitect@gmail.com)"}

    try:
        res = requests.get(url, params=params, headers=headers, timeout=15)
        if res.status_code == 200:
            pages = res.json().get("query", {}).get("pages", {})
            for pid, page in pages.items():
                for info in page.get("imageinfo", []):
                    raw_url = info.get("url", "")
                    clean_url = raw_url.split("?")[0]
                    size = info.get("size", 0)
                    if clean_url.lower().endswith((".jpg", ".jpeg", ".png")) and size > 40000:
                        img_res = requests.get(raw_url, headers=headers, timeout=20)
                        if img_res.status_code == 200 and len(img_res.content) > 30000:
                            local_path = IMAGE_DIR / filename
                            with open(local_path, "wb") as f:
                                f.write(img_res.content)
                            logger.info(f"✔ Dynamic Architectural Media acquired: {local_path.name} ({size} bytes)")
                            return str(local_path)
    except Exception as e:
        logger.debug(f"Dynamic Architectural Media query note: {e}")

    return None


def get_curated_studio_image(concept: str, image_type: str) -> Optional[str]:
    """
    Selects a matching high-resolution architectural asset from Anvitam's
    curated studio library. Whitelisted authentic assets with zero watermark.
    """
    if not STUDIO_LIBRARY_DIR.exists():
        return None

    all_images = list(STUDIO_LIBRARY_DIR.glob("*.jpg")) + list(STUDIO_LIBRARY_DIR.glob("*.png"))
    if not all_images:
        return None

    concept_lower = concept.lower()
    for img in all_images:
        name_lower = img.name.lower()
        if "3d" in concept_lower and "3d" in name_lower:
            return str(img)
        if any(k in concept_lower for k in ["site", "context", "soil", "permaculture"]) and "site" in name_lower:
            return str(img)
        if any(k in concept_lower for k in ["climate", "sun", "wind", "passive"]) and "climate" in name_lower:
            return str(img)
        if any(k in concept_lower for k in ["sketch", "drawing", "concept", "plan"]) and "conceptual" in name_lower:
            return str(img)
        if any(k in concept_lower for k in ["build", "execution", "contractor", "supervision"]) and "execution" in name_lower:
            return str(img)

    # No keyword match -> no image. A random unrelated studio photo is worse
    # than none (it misrepresents the topic on socials and the blog cover).
    return None


def build_sketch_artist_prompt(concept: str) -> str:
    """
    Transforms any architectural, ecological, or interior design concept into Archana Gavas's
    signature architectural sketching artist style:
    - Line drawings: clean architectural linework, hand or digital
    - Annotated: every element labelled in English with local name in brackets consistent with documentary atlas tone
    - Hatching for soil layers, earthworks, rammed earth, and simple section cuts
    - Clean graphic architectural scale bar on every sketch
    - Text credit: 'archana gavas, founder of anvitam.com - email - ar.archanagavas@gmail.com'
    - Strictly NO logo.
    """
    clean = concept.replace('"', '').replace("'", "").strip()
    if "archana gavas" in clean.lower() and "scale bar" in clean.lower():
        return clean

    # Strip photographic / CGI camera jargon that conflicts with architectural sketching
    for phrase in [
        "stunning architectural photograph", "architectural photograph", "photograph", "photography",
        "hasselblad", "canon", "8k", "photorealistic", "cinematic composition", "ultra-detailed 8k",
        "realistic photo", "dslr", "dwell magazine cover style", "architectural digest photography"
    ]:
        clean = clean.replace(phrase, "").replace(phrase.capitalize(), "").replace(phrase.title(), "")

    clean = " ".join(clean.split()).strip(" ,;-")

    return (
        f"Clean architectural line drawing and artistic architectural sketch with suitable subtle earthy watercolor washes. "
        f"Subject: {clean}. "
        f"Do: Line drawings — clean architectural linework, hand or digital. "
        f"Annotated — every element labelled in English with local name in brackets consistent with the book's likely documentary tone. "
        f"Hatching for soil layers, simple section cuts, that's enough. "
        f"Scale bar on every sketch — client's illustrators need this for the Atlas maps. "
        f"Text credit in neat architectural lettering in bottom corner: 'archana gavas, founder of anvitam.com - email - ar.archanagavas@gmail.com'. "
        f"Clean textured off-white paper background. Strictly no logo, no emblem, no watermark icon."
    )


def generate_architectural_image(
    concept: str,
    aspect_ratio: str = "16:9",
    image_type: str = "blog_cover"
) -> Dict[str, Any]:
    """
    Master entrypoint to generate high-end architectural imagery for Archana Gavas.
    Enforces clean architectural linework, annotations, soil section cuts, scale bar, and personal text attribution.
    Guarantees permanent Cloudinary CDN URLs for seamless social syndication.
    Returns direct_url=None when every generator fails — callers must not
    substitute placeholder/test images.
    """
    clean_concept = concept.replace('"', '').replace("'", "").strip()
    timestamp = int(time.time())
    filename = f"anvitam_{image_type}_{timestamp}.jpg"

    # Transform visual concept into Archana's signature architectural sketching artist style
    prompt = build_sketch_artist_prompt(clean_concept)

    # 1. Primary: Google Gemini Image Generation
    img_path = generate_gemini_image(prompt, filename)
    if img_path and os.path.exists(img_path):
        cdn_url = upload_to_cloudinary(img_path, public_id=f"anvitam_{image_type}_{timestamp}")
        return {
            "local_path": img_path,
            "direct_url": cdn_url or f"file:///{img_path}",
            "prompt": prompt,
            "source": "gemini_image"
        }

    # 2. Secondary: Hugging Face Serverless FLUX.1 / SDXL
    img_path = generate_hf_image(prompt, filename)
    if img_path and os.path.exists(img_path):
        cdn_url = upload_to_cloudinary(img_path, public_id=f"anvitam_{image_type}_{timestamp}")
        return {
            "local_path": img_path,
            "direct_url": cdn_url or f"file:///{img_path}",
            "prompt": prompt,
            "source": "huggingface_flux"
        }

    # 3. Tertiary: Dynamic Architectural Engine (Wikimedia Commons API)
    img_path = generate_dynamic_architectural_image(clean_concept, filename)
    if img_path and os.path.exists(img_path):
        cdn_url = upload_to_cloudinary(img_path, public_id=f"anvitam_{image_type}_{timestamp}")
        return {
            "local_path": img_path,
            "direct_url": cdn_url or f"file:///{img_path}",
            "prompt": prompt,
            "source": "dynamic_architectural_engine"
        }

    # 4. Quaternary: Whitelisted Curated Studio Library Asset
    studio_img = get_curated_studio_image(clean_concept, image_type)
    if studio_img and os.path.exists(studio_img):
        cdn_url = upload_to_cloudinary(studio_img, public_id=f"anvitam_{image_type}_{timestamp}")
        return {
            "local_path": studio_img,
            "direct_url": cdn_url or f"file:///{studio_img}",
            "prompt": prompt,
            "source": "studio_architectural_asset"
        }

    # Every generator failed: report failure honestly instead of serving a
    # placeholder/test image as if it were the article's visual.
    logger.error("Image generation failed on all providers (Gemini, HF, Wikimedia, studio library).")
    return {
        "local_path": str(IMAGE_DIR / filename),
        "direct_url": None,
        "prompt": prompt,
        "source": "failed_no_image"
    }
