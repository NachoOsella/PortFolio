---
title: I built an image pipeline one pixel at a time
slug: gruvboxitator-pixel-pipeline
description: "I explain how I built Gruvboxitator's browser-only pipeline: tonal mapping, sharpening, seeded grain, responsive progress, and an accessible comparison control."
status: published
ink: orange
category: Frontend engineering
tags:
  - TypeScript
  - Canvas
  - Image processing
  - React
publishedAt: 2026-07-28
updatedAt: 2026-08-03
seoTitle: I built a browser image-processing pipeline in TypeScript
seoDescription: "I walk through Gruvboxitator's local pixel pipeline: cubic tonal mapping, deterministic grain, canvas processing, and an accessible before-and-after comparison."
---

# I started with a privacy constraint

I built Gruvboxitator around a constraint that is also the product promise: the image stays in the browser. I use `createImageBitmap` to decode a local file, draw it into an `HTMLCanvasElement`, read the pixels as `ImageData`, and process a copied `Uint8ClampedArray`. I never send the file to a server because the browser already has everything I need to produce the result.

That decision removed accounts, uploads, storage, and an entire class of trust questions. It also meant I had to respect the limits of a client-side computation instead of hiding them behind an API.

## I made the pipeline an explicit sequence

My processor applies eleven stages in order:

1. I enhance the initial linear contrast.
2. I apply a Gaussian unsharp mask.
3. I map luminance onto the Gruvbox Material Dark Hard ramp with cubic Hermite interpolation.
4. I apply a radial cosine vignette.
5. I move saturated colors toward the nearest Gruvbox accent on the hue wheel.
6. I mix in a controlled amount of warmth toward Gruvbox yellow.
7. I normalize the luminance range against percentile bounds.
8. I clamp values below the `bg0` floor.
9. I add seeded grain.
10. I apply a final contrast pass and a softer unsharp mask.
11. I clamp the black floor one last time.

The sequence carries more intent than any individual filter. Sharpening before tonal mapping preserves edges before I compress the image into the palette. Luminance normalization comes after toning because color changes perceived brightness. Grain belongs near the end because later interpolation would otherwise wash it out.

## I used a continuous ramp instead of posterizing

A palette converter can easily turn a photograph into a stack of hard bands. I wanted the image to feel like it belonged to Gruvbox without losing its depth, so I treat the dark-to-light palette as a continuous ramp. For each pixel, I find the neighboring stops and interpolate between them with a smooth cubic curve.

```ts
function tonalColor(value: number): RGB {
  const t = clamp01(value)
  const [start, end] = neighboringStops(t)
  const local = smoothStep((t - start.position) / (end.position - start.position))
  return mix(start.color, end.color, local)
}
```

I introduce chroma separately by selecting the closest accent hue and limiting how strongly it can influence the tonal result. That separation lets me change warmth or color strength without rebuilding the luminance model.

## I made grain deterministic

Unseeded noise creates a bad comparison: the output appears to shimmer whenever I process the same image again. I start the generator from `0x67727576`, the ASCII spelling of “gruv,” and advance it with integer operations:

```ts
const seededRandom = () => {
  let state = 0x67727576
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = value + Math.imul(value ^ (value >>> 7), 61 | value) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}
```

The same source image and preset now produce the same noise. That makes the visual comparison calmer and gives me a result I can reason about rather than a filter that changes its evidence every time it runs.

## I designed four distinct presets

Dark Hard, Carbon, Cinema, and Soft share the same palette but make different trade-offs. Each changes contrast, color strength, warmth, grain, vignette, sharpening, and overall strength. Dark Hard aims for a balanced conversion, Carbon pulls color back, Cinema exaggerates contrast and atmosphere, and Soft lets more of the original survive.

I kept those settings in data rather than scattering them through the processor. A preset is a readable object with a name and a set of parameters, not a branch of special cases hidden inside a pixel loop.

## I kept the browser honest about work

The processor still runs on the main thread. I do not pretend that “local” means “free,” especially for large images. I report progress, yield with `requestAnimationFrame` at two deliberate points, and show a clear error when a source is too demanding. A future Worker path would improve the ceiling, but I left that boundary out of the first version because it would also introduce message serialization and another lifecycle to manage.

## I treated the comparison handle as a real control

The before-and-after stage uses `clip-path`, but clipping is only the visual layer. I built the handle as a button with `role="slider"`, a current value from 0 to 100, visible focus, pointer capture, arrow-key movement, `Shift` jumps, and `Home`/`End` shortcuts. I also respect reduced-motion preferences.

I wanted the person using a keyboard or assistive technology to receive the same comparison as the person dragging a pointer. Custom visuals do not earn an exception from custom semantics.

## What I would change next

I would move processing into a Web Worker for very large files and add golden-image tests alongside the current build and lint checks. I would keep the rest of the architecture small: one client-side pipeline, four explainable presets, and no backend to maintain.

## What I learned

Image processing forced me to translate vague visual language into bounded, repeatable math. “Warmer,” “deeper,” and “more cinematic” became parameters, interpolation curves, and an ordered sequence. I enjoyed the result because I could explain the machinery underneath it.
