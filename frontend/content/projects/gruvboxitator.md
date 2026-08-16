---
title: Gruvboxitator
slug: gruvboxitator
description: "I built a browser-only image tool that remaps photos toward the Gruvbox Material Dark Hard palette without uploading a byte."
status: published
ink: orange
featured: true
projectType: Frontend tool
role: I designed and engineered the complete client-side experience
duration: One-week build
technologies:
  - React 19.2
  - TypeScript 6
  - Vite 8
  - Canvas API
  - Tailwind CSS 4
  - Base UI
  - shadcn/ui
repositoryUrl: https://github.com/NachoOsella/gruvboxitator-web
publishedAt: 2026-07-26
updatedAt: 2026-08-03
displayOrder: 3
---

# Overview

I built Gruvboxitator around a strict promise: an image should never need to leave the browser to become part of my favorite palette. I load the file with `createImageBitmap`, draw it into a canvas, extract `ImageData`, transform the pixels in a `Uint8ClampedArray`, and let the user download a PNG. There is no backend, account, upload, or remote processing step.

## I made the pipeline explicit

I apply eleven transformations in a deliberate order:

1. I increase the initial contrast.
2. I apply a Gaussian unsharp mask.
3. I map luminance onto a continuous Gruvbox ramp with cubic Hermite interpolation.
4. I add a radial cosine vignette.
5. I mix saturated pixels toward the nearest Gruvbox accent.
6. I add a controlled amount of warmth toward Gruvbox yellow.
7. I normalize the luminance range.
8. I clamp the dark floor to `bg0`.
9. I add seeded grain.
10. I apply a final contrast pass and a softer unsharp mask.
11. I perform the final black-floor clamp.

The order is not decoration. Sharpening before tonal mapping protects edges, while luminance normalization after toning keeps the image from collapsing into a muddy middle. Grain belongs near the end so the later math does not erase it.

## I gave the filter four personalities

Dark Hard, Carbon, Cinema, and Soft share the same palette but not the same behavior. I tune their contrast, color strength, warmth, grain, vignette, sharpening, and overall strength independently. The result is not four labels on one filter; each preset makes a different argument about how much of the original image should survive.

## I treated comparison as a real control

The before-and-after view uses `clip-path`, but I did not let the visual trick decide the semantics. The comparison handle exposes `role="slider"`, minimum and maximum values, the current position, visible focus, pointer capture, arrow-key movement, `Shift` jumps, and `Home`/`End`. I also respect reduced-motion preferences.

A custom interaction is still an interaction. I wanted keyboard users to receive the same useful comparison as someone dragging the handle with a mouse.

## I kept the texture reproducible

My grain generator starts from the fixed seed `0x67727576`, the hexadecimal spelling of “gruv” in ASCII. The same source image and preset therefore produce the same noise on every run. Reproducibility matters here because a comparison slider becomes distracting when the output changes each time the UI re-renders.

The interface exposes all fourteen palette tones, supports an optional palette-swatch download, reports processing progress, and handles drag-and-drop as well as file selection. I keep the processor on the main thread for now and yield with `requestAnimationFrame` at two explicit points; that is a measured compromise, not a claim that very large images are free.

## What I would change next

I would move the pixel work into a Web Worker for very large files and add a small set of golden-image tests alongside the current build and lint checks. I would keep the core promise unchanged: the image-processing path should remain local, inspectable, and independent of a server.

## What I learned

Image processing made visual language answer to mathematics. “Warmer,” “deeper,” and “more cinematic” only became useful once I expressed them as ordered transforms with bounded parameters and a reproducible random source. I enjoyed the interface, but I trusted it because I could still explain every pixel decision underneath it.
