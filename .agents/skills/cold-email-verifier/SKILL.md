---
name: cold-email-verifier
description: Validates cold email deliverability, syntax, MX records, SPF/DKIM sanity, and ensures emails pass anti-spam heuristic filters before dispatch.
metadata:
  version: 1.0.0
  source: https://github.com/Varnan-Tech/opendirectory/tree/main/skills/cold-email-verifier
---

# Cold Email Verifier

Guidelines for pre-send validation:
1. Ensure email has valid RFC 5322 syntax.
2. Confirm domain MX records are active.
3. Check against common spam trigger words ("free guarantee", "risk-free", "act now", "100% discount").
4. Ensure sender has matching reply-to (`ar.archanagavas@gmail.com`).
5. Ensure plain-text readable without complex HTML blocks that trigger promotional tabs.
