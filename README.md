# Developer Portfolio

A modern, full-stack developer portfolio with integrated blog, built with Angular 21, NestJS, and Tailwind CSS 4. Features server-side rendering (SSR), a custom markdown-based content pipeline, and a secure admin dashboard.

[Live Demo](https://your-portfolio-url.com) · [Report Bug](https://github.com/NachoOsella/PortFolio/issues) · [Request Feature](https://github.com/NachoOsella/PortFolio/issues)

---

## Overview

This portfolio showcases projects, skills, and technical writing through a clean, performance-focused architecture. Content is authored in Markdown with YAML frontmatter and processed at build time into optimized JSON for instant delivery.

**Core Philosophy:** Fast by default, beautiful by design, simple to maintain.

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Angular SSR   │────▶│   NestJS API     │────▶│   Content       │
│   Frontend      │     │   (Serverless)   │     │   (Markdown)    │
│                 │     │                  │     │                 │
│  • Server-side  │     │  /api/contact    │     │  blog/*.md      │
│    rendering    │     │  /api/blog       │     │  projects.json  │
│  • Dark mode    │     │  /api/projects   │     │  skills.json    │
│  • Animations   │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                        │
         └───────────────────────┴────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────┐
                    │   Build Pipeline   │
                    │                    │
                    │  markdown → html   │
                    │  syntax highlight  │
                    │  json generation   │
                    └────────────────────┘
```

---

## Tech Stack

**Frontend**
- Angular 21 with standalone components
- Angular SSR for SEO and performance
- Tailwind CSS 4
- Lucide Angular icons
- RxJS

**Backend**
- NestJS 10
- Passport + JWT authentication
- Resend email service
- class-validator DTOs
- Rate limiting

**Content**
- Markdown with YAML frontmatter
- gray-matter for parsing
- marked for HTML conversion
- Shiki for syntax highlighting
- reading-time for estimates

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/NachoOsella/PortFolio.git
cd PortFolio

# Install dependencies
npm install

# Build content
npm run build:content

# Start development
npm run dev
```

**Development URLs**
- Frontend: http://localhost:4200
- API: http://localhost:3000/api

---

## Project Structure

```
PortFolio/
├── api/                    # NestJS backend
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/               # Angular application
│   ├── src/
│   │   ├── app/
│   │   ├── index.html
│   │   └── styles.css
│   └── angular.json
├── content/                # Source content
│   ├── blog/              # Markdown posts
│   ├── projects.json
│   └── skills.json
├── scripts/               # Build scripts
│   └── build-content.ts
└── generated/             # Build output
    ├── blog/
    ├── blog-index.json
    ├── projects.json
    └── skills.json
```

---

## Content Management

### Blog Posts

Create a new post in `content/blog/{slug}/index.md`:

```markdown
---
title: "Post Title"
slug: "post-slug"
date: "2026-02-11"
tags: ["angular", "tutorial"]
excerpt: "Brief summary"
published: true
---

# Post Title

Your content here...

```typescript
const example = 'code block';
```
```

Build: `npm run build:content`

### Projects

Edit `content/projects.json`:

```json
{
  "id": "project-id",
  "title": "Project Name",
  "description": "Short description",
  "technologies": ["Angular", "NestJS"],
  "featured": true,
  "links": {
    "live": "https://example.com",
    "github": "https://github.com/user/repo"
  }
}
```

---

## Deployment

**Vercel**

1. Connect repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `frontend/dist/frontend`
4. Add environment variables
5. Deploy

Vercel automatically deploys on push to `main`.

---

## Environment Variables

Create `.env` from `.env.example`:

```bash
SITE_URL=https://your-domain.com
ADMIN_PASSWORD_HASH=your_bcrypt_hash
ADMIN_JWT_SECRET=your_random_secret
RESEND_API_KEY=re_your_key
CONTACT_EMAIL=your@email.com
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API and frontend concurrently |
| `npm run build` | Build content, API, and frontend |
| `npm run build:content` | Process markdown to JSON |
| `npm run build:api` | Build NestJS API |
| `npm run build:frontend` | Build Angular app |

---

## Progress

**Phase 1: Foundation** Complete
- [x] Repository setup
- [x] NestJS API
- [x] Angular frontend with SSR
- [x] Content pipeline

**Phase 2: Core Infrastructure** In Progress
- [x] App configuration
- [ ] Routing and services
- [ ] Layout components

**Phase 3-9:** Pending

---

## Documentation

- [Angular](https://angular.dev)
- [NestJS](https://docs.nestjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Shiki](https://shiki.matsu.io)

---

## License

MIT License. Use as a template for your own portfolio.

---

Built with [Angular](https://angular.io/), [NestJS](https://nestjs.com/), and [Tailwind CSS](https://tailwindcss.com).