---
title: Gruvboxitator
slug: gruvboxitator
description: Browser-only image converter that maps photos onto the Gruvbox Material Dark Hard palette. No uploads, no server, no sign-up — just a pixel pipeline.
status: published
ink: orange
featured: true
projectType: Frontend tool
role: Design and engineering
duration: 1 week
technologies:
  - React 19
  - TypeScript
  - Vite
  - Canvas API
  - Tailwind CSS 4
  - shadcn/ui
repositoryUrl: https://github.com/NachoOsella/gruvboxitator-web
publishedAt: 2026-07-26
updatedAt: 2026-08-03
displayOrder: 3
---

# Overview

Gruvboxitator converts any image to the Gruvbox Material Dark Hard palette directly in the browser. Files never leave the machine: the whole pipeline runs on `OffscreenCanvas` and `ImageBitmap` over a `Uint8ClampedArray`, with no image-processing library.

## The pixel pipeline

Eleven ordered transforms, all implemented by hand: initial contrast, gaussian unsharp mask, tonal mapping onto the Gruvbox ramp (`bg0` to `fg1`) with cubic Hermite interpolation, radial cosine vignette, color toning toward the nearest Gruvbox accent on the hue wheel, warmth, luminance normalization, black floor clamp, deterministic grain, and a final contrast pass.

## Key decisions

- **Four verified presets.** Dark Hard, Carbon, Cinema, and Soft each tune contrast, saturation, vignette, and grain — and each pair was verified to produce visibly different output (mean absolute pixel difference above 6 on a synthetic test image).
- **Deterministic grain.** The noise generator is an LCG seeded with `0x67727576` ("gruv" in ASCII), so the same image and preset always produce the exact same result — no flicker in the before/after comparison.
- **Accessible comparison slider.** `clip-path` based, with `role="slider"`, `setPointerCapture` drag, arrow keys (10-step with Shift), Home/End, and `reduced-motion` respected.
- **No main-thread stalls.** `requestAnimationFrame` between pipeline phases keeps large images responsive.

## Details I enjoyed

The 14-color palette is rendered as an interactive mosaic with name and hex tooltips, and can be exported as a standalone PNG. The interface is a single locked dark theme set in Geist, and the background grain is an inline SVG `feTurbulence` overlay isolated behind `pointer-events: none`.

## Lessons learned

Pixel work rewards boring discipline: measure every preset, seed every random source, and keep the pipeline order explicit. The fun parts — toning, warmth, grain — only read as intentional when the math underneath is reproducible.
