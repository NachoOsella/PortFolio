---
title: Eleven steps over a Uint8ClampedArray
slug: gruvboxitator-pixel-pipeline
description: How I built Gruvboxitator's browser-only image pipeline — tonal mapping, unsharp masks, deterministic grain, responsive processing, and an accessible comparison slider.
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
seoTitle: Building a browser image-processing pipeline in TypeScript
seoDescription: "Inside Gruvboxitator's browser-only pixel pipeline: cubic tonal mapping, deterministic grain, OffscreenCanvas processing, and accessible before-and-after comparison."
---

# A color converter that never sees your files

Gruvboxitator converts images to the Gruvbox Material Dark Hard palette without uploading them anywhere. There is no server, account, or analytics pipeline between the file picker and the result. The browser decodes the image into an `ImageBitmap`, draws it to an `OffscreenCanvas`, and the processing function works directly over a `Uint8ClampedArray`.

The privacy argument is simple: if the browser already has everything needed to transform an image, sending it across the network would only add latency, cost, and a trust problem.

The implementation was less simple. A strict palette conversion can destroy an image's depth; a cinematic filter can keep depth but stop looking like Gruvbox. The final pipeline uses eleven ordered transformations to preserve enough of both.

## The pipeline is an explicit sequence

Each pixel begins as RGBA data. The processor applies these stages in order:

1. Initial linear contrast.
2. Gaussian unsharp mask.
3. Tonal mapping from `bg0` to `fg1` with cubic Hermite interpolation.
4. Radial cosine vignette.
5. Toning toward the nearest Gruvbox accent on the hue wheel.
6. Warmth mixed toward Gruvbox yellow.
7. Original-luminance range normalization.
8. Clamp values below `bg0` to Gruvbox black.
9. Deterministic grain.
10. Final contrast and soft post-sharpening.
11. Final black-floor clamp.

The order is part of the design. Sharpening before tonal mapping preserves edge information; doing it only afterward exaggerates palette boundaries. Luminance normalization comes after warmth and toning because those stages alter perceived brightness. Grain goes near the end so later interpolation does not blur it away.

## Tonal mapping without flat posterization

Mapping luminance directly to a short palette produces hard bands. Instead, Gruvboxitator treats the dark-to-light palette as a continuous ramp and interpolates between neighboring stops with a cubic Hermite curve:

```ts
function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}

function interpolateChannel(from: number, to: number, amount: number) {
  return Math.round(from + (to - from) * smoothStep(amount));
}
```

That small curve removes the mechanical edge of linear interpolation without inventing colors outside the two selected stops. Chroma is introduced separately by choosing the nearest accent hue and controlling the mix per preset.

## Four presets that are measurably different

Dark Hard, Carbon, Cinema, and Soft are not renamed copies of one settings object. Each adjusts contrast, saturation, vignette, warmth, sharpening, and grain. I verified the distinction using a synthetic source image and calculated mean absolute pixel differences between every output pair; each pair had to stay above 6.

That test caught a real design problem: an early Carbon preset looked different to me while tuning, but differed too little from Soft under neutral images. Lowering Carbon's color strength and adjusting its black floor made its identity survive beyond the hand-picked demo photo.

## Reproducible texture

Random grain creates a bad comparison slider: every re-render changes both sides and appears to shimmer. Gruvboxitator uses a linear congruential generator with a fixed seed:

```ts
let seed = 0x67727576; // "gruv" in ASCII

function random() {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 0x100000000;
}
```

The same image and preset therefore produce the same noise, byte for byte. Reproducibility also made tests and visual diffs useful instead of probabilistic.

## Keeping the browser responsive

The calculation still runs on the client, so "local" does not automatically mean "fast." Decoding through `ImageBitmap` avoids unnecessary DOM image work, while `OffscreenCanvas` keeps the processing surface independent of what React renders. Between expensive phases, the pipeline yields with `requestAnimationFrame`. A large image may still take time, but the controls and progress state do not freeze.

A future version could move the whole processor into a Web Worker. I kept that out of the first version because yielding between phases met the interaction target without introducing message serialization and a second execution boundary.

## The comparison control is still a control

The before-and-after view uses `clip-path`, but visually clipping an image does not make an accessible slider. Its handle has `role="slider"`, current/min/max values, visible focus, and keyboard behavior: arrows move one step, Shift+arrow moves ten, and Home/End jump to the limits. Pointer dragging calls `setPointerCapture`, so the handle keeps receiving movement even when the pointer escapes its narrow hit area. Reduced-motion preferences are respected.

This was the most frontend-specific lesson in the project: custom visuals do not excuse custom semantics. If it behaves like a slider, assistive technology should meet a slider.

## What I would change next

I would add a Worker path for very large files and a small suite of golden-image tests in addition to the synthetic pixel-difference checks. I would not add a backend. Local processing is not an implementation detail here; it is the product promise.

The rewarding part of image processing is that vague visual words — "warmer," "deeper," "more cinematic" — eventually have to become numbers in a repeatable sequence. Once every random source is seeded and every preset is measured, the result stops being a filter that happened to look good and becomes a pipeline I can explain.
