# Ignacio Osella Portfolio + Markdown Studio

A premium React/Vite portfolio and frontend-only Markdown content management system for Ignacio Osella, a full-stack developer focused on React, TypeScript, Java, Spring Boot, relational databases, Docker, and web application architecture.

The public website is the product. The private Studio workspace is a realistic browser mock for authoring Markdown, previewing content, importing and exporting files, and rehearsing server and Git workflows before a future Java/Spring Boot API exists.

## Technology stack

- React 19, TypeScript, Vite, pnpm
- Tailwind CSS v4 and a custom design system inspired by shadcn/ui primitives
- React Router, TanStack Query, Motion for React
- React Hook Form, Zod, Lucide React
- React Markdown, remark-gfm, rehype-highlight, gray-matter
- Vitest, jsdom, React Testing Library

## Installation

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The development server runs on the Vite default port. Build the production bundle with `pnpm build`.

## Commands

```bash
pnpm dev          # Start Vite
pnpm build        # TypeScript build and production bundle
pnpm preview      # Preview the production bundle
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm test         # Vitest run
pnpm test:watch   # Vitest watch mode
```

## Environment variables

```env
VITE_API_URL=http://localhost:8080/api
```

`VITE_API_URL` is a future Java API base URL. The current application uses mock repositories and does not call it.

## Folder structure

```text
content/
├── projects/        # Project Markdown files
├── posts/           # Blog Markdown files
└── pages/           # Static page Markdown files
src/
├── api/             # Centralized future HTTP client
├── app/             # Router and app metadata
├── components/      # Public, Markdown, editor, and UI components
├── context/         # Query and mock auth providers
├── hooks/           # Repository query hooks and public content hooks
├── layouts/         # Public and protected admin layouts
├── lib/             # Markdown, frontmatter, date, and reading utilities
├── mocks/           # Seed Markdown imports, messages, and Git history
├── pages/           # Public and admin route composition
├── repositories/    # Repository interfaces and local mock adapters
├── schemas/         # Strict Zod frontmatter schemas
├── services/        # Downloads, drafts, and message persistence
├── styles.css       # Global reset, fonts, and accessibility defaults
├── styles/          # Public v2 and admin Gruvbox styling
└── types/           # Domain types and API contracts
```

## Markdown content format

Every content file begins with YAML frontmatter followed by a Markdown body. The frontend treats the raw file as canonical. Unknown frontmatter properties are preserved when a known field is edited.

### Project frontmatter

```md
---
title: Modular ERP Platform
slug: modular-erp
description: A reusable ERP foundation designed for small and medium businesses.
status: published
featured: true
projectType: Full-stack application
role: Full-stack developer
duration: Ongoing
technologies:
  - React
  - TypeScript
  - Spring Boot
updatedAt: 2026-07-28
---

# Overview

Markdown content goes here.
```

### Blog frontmatter

```md
---
title: Building reusable feature modules in React
slug: react-feature-architecture
description: A practical approach to organizing maintainable React applications.
status: published
featured: true
category: React
tags:
  - React
  - TypeScript
publishedAt: 2026-07-20
updatedAt: 2026-07-25
---
```

Blog posts with `draft`, `archived`, or future `scheduled` statuses never appear on public routes.

### Page frontmatter

```md
---
title: About
slug: about
description: More about Ignacio Osella and his development approach.
status: published
updatedAt: 2026-07-25
---
```

## Markdown import and export

The Studio file manager accepts `.md` files through a native browser file input. It reads the file in the browser, parses and validates frontmatter, detects a collection from the metadata, and writes it to the mock content repository. Conflicting paths require explicit overwrite behavior in the repository contract.

Exports preserve YAML frontmatter, Markdown formatting, unknown metadata, and UTF-8 content. The export-all action is a ZIP-style mock archive represented as a downloadable text bundle because no backend or filesystem is present.

## Local mock persistence

`contentRepository`, `gitRepository`, `authRepository`, message persistence, and draft persistence use versioned localStorage keys behind service/repository boundaries. Pages and components do not read localStorage directly for content. Clear site storage to reset the browser demo to seeded content.

The mock repository simulates promise latency, CRUD operations, version numbers, modified timestamps, synchronization states, and opt-in recoverable failures via the browser console:

```js
localStorage.setItem('ignacio-mock-errors', 'true');
```

## Authentication warning

The login screen is not secure authentication. It is an isolated mock session layer used only to demonstrate protected routes and UI states. It should not be used with real credentials. Production authentication must be implemented by Spring Boot with secure HttpOnly cookies, server-side session validation, authorization checks, expiry handling, and audit logs.

## Mock Git workflow

The Studio Git screen models a deliberately explicit flow:

1. Edit a Markdown file.
2. Save it to the mock content server.
3. Review modified, added, deleted, and untracked files.
4. Enter or accept a commit message suggestion.
5. Create a local commit.
6. Push explicitly to the mock remote.

The browser never executes Git commands and never stores repository tokens, GitHub personal access tokens, SSH private keys, or remote credentials. A real backend must perform Git operations securely.

## Synchronization states

The content types distinguish the following states:

- `local-draft`: an editor-only autosave exists.
- `modified`: saved frontend state differs from the mock server baseline.
- `syncing`: a future server request is in flight.
- `synced`: local state matches the mock server.
- `commit-required`, `committed`, `push-required`, `pushed`: Git workflow states.
- `conflict` and `error`: recoverable exceptional states that future API responses can expose.

## Replacing mock repositories with the Java API

The future adapter should implement the repository interfaces in `src/repositories/`. TanStack Query hooks should remain the UI data boundary; the current browser mock does not include an API client.

Conceptually:

```text
React frontend
    ↓ REST API
Spring Boot backend
    ↓
Server content directory
    ↓
Git repository
    ↓
Remote Git hosting provider
```

The Spring Boot backend, not the browser, will parse and validate files, write to the server content directory, manage file locking, execute Git operations, authenticate securely, hold repository credentials, detect conflicts, manage backups, and write audit logs. Future endpoints can follow the contracts in the brief: `/api/content`, `/api/content/file`, `/api/content/import`, `/api/content/export`, `/api/git/status`, `/api/git/history`, `/api/git/commit`, `/api/git/push`, `/api/git/pull`, `/api/git/sync`, and `/api/auth/*`.

## Production build

```bash
pnpm build
pnpm preview
```

The Vite SPA is structured so a prerendering layer can add route metadata later. `Seo` updates document title, description, and canonical URL on the client while keeping the abstraction ready for server or prerendered metadata.
