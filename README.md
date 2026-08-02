<p align="center">
  <img src="frontend/public/favicon.svg" alt="Ignacio Osella portfolio mark" width="88" />
</p>

<h1 align="center">Ignacio Osella · Portfolio</h1>

<p align="center">
  A premium, Markdown-first portfolio for a full-stack developer building thoughtful and maintainable digital products.
</p>

<p align="center">
  <a href="https://github.com/NachoOsella/portfolio">Repository</a>
  ·
  <a href="frontend/README.md">Frontend documentation</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white" alt="pnpm workspace" />
</p>

![Portfolio homepage](frontend/.artifacts/final-home-desktop.png)

## Overview

This repository is the home of Ignacio Osella's personal portfolio and its future content platform. The public experience presents selected projects, technical writing, professional context, and contact information through a restrained Gruvbox-inspired visual system.

The project is intentionally Markdown-first: projects, articles, and static pages are authored as files, validated through frontmatter schemas, and rendered consistently across the public site and the private Studio workspace.

> [!NOTE]
> The current release is frontend-only. The backend and Docker layers are prepared for a future Spring Boot API, server-side authentication, filesystem persistence, and secure Git workflows.

## What is included

### Public portfolio

- Responsive home page with kinetic typography and pointer-reactive geometry.
- Project index and detailed project stories with system diagrams.
- Technical writing index and article pages.
- About and contact experiences.
- Responsive layouts with reduced-motion support and accessible interaction states.

### Private Studio

The `/admin` workspace is a browser-based content-management prototype for:

- Creating and editing projects, posts, and pages.
- Previewing Markdown and validating YAML frontmatter.
- Importing and exporting content files.
- Managing drafts and local persistence.
- Reviewing simulated Git status, commits, and pushes.
- Handling messages, settings, and protected routes.

> [!WARNING]
> Studio authentication and Git actions are mocks for the frontend prototype. The browser does not execute Git commands, write to a server filesystem, or store real credentials.

## Technology

- React 19 and TypeScript
- Vite 7 and pnpm
- Tailwind CSS 4 with a custom design system
- React Router and TanStack Query
- Motion for React
- React Hook Form and Zod
- React Markdown, remark-gfm, rehype-highlight, and YAML
- Vitest, jsdom, and React Testing Library

## Project structure

```text
.
├── frontend/                 # React/Vite application
│   ├── content/              # Markdown pages, posts, and projects
│   ├── public/               # Static assets and favicon
│   ├── src/
│   │   ├── app/              # Metadata and route configuration
│   │   ├── components/       # Public, editor, and UI components
│   │   ├── layouts/          # Public and protected layouts
│   │   ├── repositories/     # Mock repositories and future API boundaries
│   │   ├── schemas/          # Frontmatter validation schemas
│   │   ├── services/         # Drafts, downloads, and persistence
│   │   └── styles/            # Public and Studio visual systems
│   └── package.json
├── backend/                  # Future Spring Boot API
├── docker/                   # Future Dockerfiles and Compose configuration
└── README.md
```

## Getting started

### Requirements

- Node.js 20 or newer
- pnpm 10 or newer

### Install and run

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

The development server runs on Vite's default port. Open the local URL printed in the terminal to explore the public site.

### Available commands

Run these commands from `frontend/`:

```bash
pnpm dev          # Start the development server
pnpm build        # Type-check and build for production
pnpm preview      # Preview the production build
pnpm lint         # Run ESLint
pnpm format       # Format the source tree with Prettier
pnpm test         # Run the test suite once
pnpm test:watch   # Run tests in watch mode
```

## Content model

Content lives in `frontend/content/` and uses Markdown with YAML frontmatter.

```text
content/
├── pages/       # Static pages such as About and Now
├── posts/       # Technical articles
└── projects/    # Portfolio case studies
```

Example project metadata:

```md
---
title: Modular ERP Platform
slug: modular-erp
description: A reusable ERP foundation for small and medium businesses.
status: published
featured: true
projectType: Full-stack application
technologies:
  - React
  - TypeScript
  - Spring Boot
updatedAt: 2026-07-28
---

# Overview

The project story starts here.
```

The frontend preserves unknown frontmatter fields when known metadata is edited. Draft, archived, and scheduled posts are kept out of public routes according to their status.

## Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/projects`, `/projects/:slug`, `/blog`, `/blog/:slug`, `/about`, `/contact` |
| Studio | `/admin`, `/admin/content`, `/admin/projects`, `/admin/posts`, `/admin/pages`, `/admin/files`, `/admin/git`, `/admin/messages`, `/admin/settings` |

## Future architecture

The current repository boundaries are designed to evolve without moving content logic into the UI:

```text
React frontend
      │ REST API
      ▼
Spring Boot backend
      │
      ├── Authentication and authorization
      ├── Markdown validation and filesystem persistence
      ├── File locking, backups, and audit logs
      └── Secure Git operations
```

`frontend/src/repositories/` contains the interfaces that future REST adapters can implement. The browser mock keeps the public experience usable while the backend is being built.

## Environment

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

`VITE_API_URL` is reserved for the future Java API. The current frontend uses local mock repositories and does not call this endpoint.

## Design direction

The public interface follows a technical editorial system built around:

- Gruvbox Material Dark Hard neutrals.
- Warm typography with Archivo for display and Manrope for body copy.
- One-pixel rules, square controls, and angular geometry.
- Motion that clarifies hierarchy instead of competing with content.
- Semantic project colors used as full visual fields rather than decorative badges.

The visual system is documented in [`frontend/DESIGN.md`](frontend/DESIGN.md), and the product intent is documented in [`frontend/PRODUCT.md`](frontend/PRODUCT.md).

## Project status

The public portfolio and frontend Studio prototype are implemented. The next major layer is the Spring Boot backend that will replace local mock repositories with secure server-side content, authentication, and Git workflows.
