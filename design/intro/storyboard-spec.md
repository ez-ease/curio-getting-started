# Curio Full-Screen Intro Storyboard

Artboard: 393 × 852 px
Duration: 3.6 seconds
Background: warm white

## Animation beats

1. **Spark appears — 0.00–0.35s**
   A small purple-pink spark appears just outside the lower-left edge.

2. **Curio flies in — 0.35–1.15s**
   Curio flies diagonally toward the center. His ears trail slightly behind.

3. **Curiosity loop — 1.15–1.90s**
   Curio makes one playful loop, leaving a short purple-pink orbit trail.

4. **Soft landing — 1.90–2.45s**
   Curio lands in the center, settles with a small squash, then smiles.

5. **Logo reveal — 2.45–3.10s**
   Curio's body tucks away while his head resolves into the logo mark. The orbit trail becomes a small sparkle accent.

6. **Onboarding transition — 3.10–3.60s**
   The logo moves upward and dissolves into the Meet Curio screen. Curio returns to his onboarding idle pose.

## Rive handoff

- Keep this intro separate from the onboarding `ff` and `bw` ViewModel triggers.
- Start automatically when the file loads.
- Emit `introComplete` at 3.60s so the app can reveal Getting Started.
- Include a small app-level Skip control.
- Show the intro once, then remember completion locally.
