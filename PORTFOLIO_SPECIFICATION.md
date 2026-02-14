# Developer Portfolio & Blog - Project Specification

## Project Vision

Build a modern, performant developer portfolio with an integrated blog section. The site showcases your skills, projects, and technical writing while demonstrating full-stack proficiency with Node.js/NestJS and Angular.

**Core Sections:**
- Hero/landing with personal branding
- Projects showcase with filtering
- Skills & technology stack display
- Blog powered by Markdown files in the repo
- Contact form with email delivery
- About me with personal story
- Downloadable resume/CV

**Design Philosophy:** Clean, modern, fast. Good design speaks through restraint - whitespace, typography, and subtle animations over flashy effects.

---

## Technology Architecture

### Backend (API)
- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **Markdown Processing:** `marked` + `gray-matter` (frontmatter parsing)
- **Syntax Highlighting:** `shiki` (build-time code highlighting)
- **Email:** Resend (modern email API, generous free tier)
- **Validation:** class-validator + class-transformer (NestJS standard)
- **Authentication:** @nestjs/passport + JWT
- **No database** - all content lives as files in the repo

### Frontend
- **Framework:** Angular 17+ (standalone components, new control flow)
- **SSR:** Angular SSR (`@angular/ssr`) for SEO
- **Styling:** Tailwind CSS 4 + Angular animations
- **Icons:** Lucide icons or Tabler icons
- **Fonts:** Inter / JetBrains Mono (code)
- **Image Optimization:** `ngOptimizedImage`

### Content Pipeline
- Blog posts: Markdown files with YAML frontmatter
- Projects: JSON/YAML data files
- Skills: JSON data file
- Resume: PDF in assets
- Build script processes markdown → JSON at build time

### Deployment
- **Platform:** Traditional Linux server (VPS/VM) with Docker Compose
- **Frontend:** Angular SSR served behind Caddy
- **API:** NestJS running as a persistent Node.js process/container
- **Domain:** Custom domain with DNS pointing to the server IP
- **SSL:** Automatic HTTPS via Caddy (Let's Encrypt)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│              Linux Server (VPS / VM / Bare Metal)       │
│                  Docker Compose + Reverse Proxy          │
└───────────────┬──────────────────────┬───────────────────┘
                │                      │
    ┌───────────▼─────────┐   ┌────────▼──────────┐
    │   Angular Frontend  │   │    NestJS API     │
    │      (Caddy)        │   │    (Container)    │
    │                     │   │                   │
    │  • Home/Hero        │   │  /api/contact     │
    │  • Projects         │   │  /api/blog        │
    │  • Blog listing     │   │  /api/projects    │
    │  • Blog post        │   │  /api/admin/*     │
    │  • About            │   │                   │
    │  • Contact          │   │                   │
    └───────────┬─────────┘   └────────┬──────────┘
                │                      │
    ┌───────────▼──────────────────────▼──────────┐
    │                  Content Layer               │
    │                                              │
    │ content/blog/*.md    (Markdown posts)        │
    │ content/projects.json (Project data)         │
    │ content/skills.json   (Skills data)          │
    │ assets/resume.pdf     (Resume file)          │
    └──────────────────────────────────────────────┘
```

### Content Pipeline (Build-Time)

```
Markdown Files (.md)
       │
       ▼
┌──────────────────┐
│  Build Script    │
│  (prebuild.ts)   │
│                  │
│  • gray-matter   │ ← Parse frontmatter (title, date, tags, excerpt)
│  • marked        │ ← Convert MD → HTML
│  • shiki         │ ← Syntax highlight code blocks
│  • reading-time  │ ← Calculate word count metadata
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generated JSON  │
│                  │
│  blog-index.json │ ← List of all posts (metadata only)
│  blog/{slug}.json│ ← Full post content (HTML + metadata)
└────────┬─────────┘
         │
         ▼
  Angular imports JSON
  at build time (SSR)
  or serves via API
```

**Why build-time processing?**
- Blog content doesn't change at runtime - it changes on deploy
- Pre-processed HTML is faster than parsing on every request
- Enables Angular SSR prerendering of blog pages
- Syntax highlighting at build time (Shiki is expensive to run per-request)
- Generated JSON is served by your frontend server as static assets

---

## Project Structure

```
portfolio/
├── api/                          # NestJS backend
│   ├── src/
│   │   ├── main.ts               # Main NestJS app entry
│   │   ├── app.module.ts         # Root module
│   │   ├── contact/
│   │   │   ├── contact.controller.ts  # POST /api/contact
│   │   │   ├── contact.service.ts     # Business logic
│   │   │   └── dto/
│   │   │       └── contact.dto.ts     # Validation DTO
│   │   ├── blog/
│   │   │   ├── blog.controller.ts     # GET /api/blog, GET /api/blog/:slug
│   │   │   └── blog.service.ts        # Business logic
│   │   ├── projects/
│   │   │   ├── projects.controller.ts # GET /api/projects
│   │   │   └── projects.service.ts    # Business logic
│   │   ├── admin/
│   │   │   ├── admin.controller.ts    # Admin endpoints
│   │   │   └── admin.service.ts       # Business logic
│   │   ├── auth/
│   │   │   ├── auth.module.ts         # Auth configuration
│   │   │   ├── auth.guard.ts          # JWT guard
│   │   │   └── auth.service.ts        # Token generation
│   │   └── common/
│   │       └── filters/
│   │           └── http-exception.filter.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts     # Standalone app config
│   │   │   ├── app.routes.ts     # Route definitions
│   │   │   ├── core/
│   │   │   │   ├── services/
│   │   │   │   │   ├── api.service.ts
│   │   │   │   │   ├── seo.service.ts
│   │   │   │   │   └── theme.service.ts
│   │   │   │   └── interceptors/
│   │   │   │       └── error.interceptor.ts
│   │   │   ├── layout/
│   │   │   │   ├── header/
│   │   │   │   │   └── header.component.ts
│   │   │   │   ├── footer/
│   │   │   │   │   └── footer.component.ts
│   │   │   │   └── layout.component.ts
│   │   │   ├── pages/
│   │   │   │   ├── home/
│   │   │   │   │   ├── home.component.ts
│   │   │   │   │   ├── sections/
│   │   │   │   │   │   ├── hero.component.ts
│   │   │   │   │   │   ├── featured-projects.component.ts
│   │   │   │   │   │   ├── skills-overview.component.ts
│   │   │   │   │   │   ├── latest-posts.component.ts
│   │   │   │   │   │   └── cta.component.ts
│   │   │   │   │   └── home.component.html
│   │   │   │   ├── projects/
│   │   │   │   │   ├── projects-list.component.ts
│   │   │   │   │   └── project-detail.component.ts
│   │   │   │   ├── blog/
│   │   │   │   │   ├── blog-list.component.ts
│   │   │   │   │   └── blog-post.component.ts
│   │   │   │   ├── about/
│   │   │   │   │   └── about.component.ts
│   │   │   │   ├── contact/
│   │   │   │   │   └── contact.component.ts
│   │   │   │   └── admin/
│   │   │   │       ├── admin-login.component.ts
│   │   │   │       ├── admin-dashboard.component.ts
│   │   │   │       ├── admin-editor.component.ts
│   │   │   │       └── admin-guard.ts
│   │   │   └── shared/
│   │   │       ├── components/
│   │   │       │   ├── project-card.component.ts
│   │   │       │   ├── blog-card.component.ts
│   │   │       │   ├── skill-badge.component.ts
│   │   │       │   ├── tag-filter.component.ts
│   │   │       │   └── back-to-top.component.ts
│   │   │       ├── pipes/
│   │   │       │   └── reading-time.pipe.ts
│   │   │       └── animations/
│   │   │           ├── fade-in.animation.ts
│   │   │           └── slide-up.animation.ts
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── resume.pdf
│   │   │   └── og-image.png        # Open Graph image
│   │   ├── styles/
│   │   │   ├── styles.css           # Global styles + Tailwind
│   │   │   └── prism-theme.css      # Code block styling
│   │   └── environments/
│   │       ├── environment.ts
│   │       └── environment.prod.ts
│   ├── angular.json
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── content/                      # Content source files
│   ├── blog/                     # Blog posts organized by directory
│   │   ├── my-first-post/
│   │   │   ├── index.md          # Post content
│   │   │   └── cover.webp        # Cover image (optional)
│   │   ├── building-microservices/
│   │   │   ├── index.md
│   │   │   ├── cover.webp
│   │   │   ├── architecture-diagram.png
│   │   │   └── code-screenshot.jpg
│   │   └── ...
│   ├── projects.json             # Project data
│   ├── skills.json               # Skills data
│   └── about.md                  # About page content (markdown)
│
├── scripts/
│   └── build-content.ts          # Markdown → JSON build script
│
├── generated/                    # Build output (gitignored)
│   ├── blog-index.json
│   └── blog/
│       ├── my-first-post/
│       │   ├── index.json       # Post content + metadata
│       │   └── cover.webp       # Copied images
│       ├── building-microservices/
│       │   ├── index.json
│       │   ├── cover.webp
│       │   ├── architecture-diagram.png
│       │   └── code-screenshot.jpg
│       └── ...
│
├── package.json                  # Workspace root
├── deploy/                       # Docker Compose + Caddy deployment files
├── package-lock.json
└── README.md
```

---

## Content Data Schemas

### Blog Post Directory Structure

```
content/blog/building-microservices-nodejs-nestjs/
├── index.md                      # Post content with frontmatter
├── cover.webp                    # Cover image (optional)
├── architecture-diagram.png      # Inline images
└── code-screenshot.jpg           # Additional assets
```

### Blog Post Markdown (Frontmatter)

```markdown
---
title: "Building a Microservices Architecture with Node.js & NestJS"
slug: "building-microservices-nodejs-nestjs"
date: "2026-01-15"
updated: "2026-01-20"
excerpt: "How I built a production-ready microservices platform using Node.js runtime and the NestJS framework."
tags: ["typescript", "nodejs", "nestjs", "microservices", "docker"]
coverImage: "cover.webp"         # Relative to post directory
published: true
---

Your markdown content here...

![Architecture Diagram](./architecture-diagram.png)

Some text about the implementation...

![Code Screenshot](./code-screenshot.jpg)
```

### Generated Blog Index JSON

```json
[
  {
    "slug": "building-microservices-nodejs-nestjs",
    "title": "Building a Microservices Architecture with Node.js & NestJS",
    "date": "2026-01-15",
    "updated": "2026-01-20",
    "excerpt": "How I built a production-ready microservices platform...",
"tags": ["typescript", "nodejs", "nestjs", "microservices", "docker"],
    "coverImage": "/images/blog/microservices-cover.webp",
    "wordCount": 2100
  }
]
```

### Generated Blog Post JSON

```json
{
  "slug": "building-microservices-nodejs-nestjs",
  "title": "Building a Microservices Architecture with Node.js & NestJS",
  "date": "2026-01-15",
  "updated": "2026-01-20",
  "excerpt": "How I built a production-ready microservices platform...",
  "tags": ["typescript", "nodejs", "nestjs", "microservices", "docker"],
  "coverImage": "/images/blog/microservices-cover.webp",
  "wordCount": 2100,
  "content": "<article><h2>Introduction</h2><p>...</p></article>",
  "tableOfContents": [
    { "id": "introduction", "text": "Introduction", "level": 2 },
    { "id": "architecture", "text": "Architecture", "level": 2 }
  ]
}
```

### Projects JSON (`content/projects.json`)

```json
[
  {
    "id": "study-focus-tracker",
    "title": "Study Focus & Habit Tracker",
    "description": "A comprehensive personal productivity platform using microservices architecture.",
    "longDescription": "Built with 9 microservices, real-time WebSockets, gamification...",
    "tags": ["TypeScript", "Node.js", "NestJS", "Angular", "PostgreSQL", "Redis", "Docker"],
    "category": "fullstack",
    "image": "/images/projects/study-tracker.webp",
    "liveUrl": "https://studyfocus.example.com",
    "githubUrl": "https://github.com/username/study-focus",
    "featured": true,
    "date": "2026-01",
    "highlights": [
      "9 microservices with API gateway",
      "Real-time Pomodoro timer via WebSockets",
      "Gamification with XP, levels, and achievements",
      "Deployed on $5/month VPS"
    ]
  }
]
```

### Skills JSON (`content/skills.json`)

```json
{
  "categories": [
    {
      "name": "Languages",
      "skills": [
        { "name": "TypeScript", "icon": "typescript", "level": "advanced" },
        { "name": "JavaScript", "icon": "javascript", "level": "advanced" },
        { "name": "Python", "icon": "python", "level": "intermediate" },
        { "name": "SQL", "icon": "database", "level": "intermediate" }
      ]
    },
    {
      "name": "Frontend",
      "skills": [
        { "name": "Angular", "icon": "angular", "level": "advanced" },
        { "name": "Tailwind CSS", "icon": "tailwind", "level": "advanced" },
        { "name": "RxJS", "icon": "rxjs", "level": "intermediate" }
      ]
    },
    {
      "name": "Backend",
      "skills": [
        { "name": "Node.js", "icon": "nodejs", "level": "advanced" },
        { "name": "NestJS", "icon": "nestjs", "level": "advanced" },
        { "name": "PostgreSQL", "icon": "postgresql", "level": "intermediate" },
        { "name": "Redis", "icon": "redis", "level": "intermediate" }
      ]
    },
    {
      "name": "DevOps",
      "skills": [
        { "name": "Docker", "icon": "docker", "level": "intermediate" },
        { "name": "Git", "icon": "git", "level": "advanced" },
        { "name": "Caddy", "icon": "caddy", "level": "intermediate" }
      ]
    }
  ]
}
```

---

## Page Designs

### Home Page

```
┌──────────────────────────────────────────────────┐
│  HEADER  [Home] [Projects] [Blog] [About] [Contact]  [Theme Toggle] │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │              HERO SECTION                  │  │
│  │                                            │  │
│  │  Hi, I'm [Your Name] 👋                   │  │
│  │  Full-Stack Developer                      │  │
│  │                                            │  │
│  │  I build modern web applications with      │  │
│  │  TypeScript, Angular, and Node.js.         │  │
│  │                                            │  │
│  │  [View Projects]  [Read Blog]              │  │
│  │                                            │  │
│  │  ── Social Links (GitHub, LinkedIn, etc.)  │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ── FEATURED PROJECTS ──────────────────────     │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Project  │ │ Project  │ │ Project  │        │
│  │  Card 1  │ │  Card 2  │ │  Card 3  │        │
│  │ (image)  │ │ (image)  │ │ (image)  │        │
│  │  title   │ │  title   │ │  title   │        │
│  │  tags    │ │  tags    │ │  tags    │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│  [View All Projects →]                           │
│                                                  │
│  ── SKILLS OVERVIEW ────────────────────────     │
│                                                  │
│  Languages    Frontend     Backend     DevOps    │
│  ┌────┐       ┌────┐      ┌────┐     ┌────┐    │
│  │ TS │       │ Ng │      │Node│     │ 🐳 │    │
│  │ JS │       │ TW │      │Nest│     │Git │    │
│  │ Py │       │RxJS│      │ PG │     │ ▲  │    │
│  └────┘       └────┘      └────┘     └────┘    │
│                                                  │
│  ── LATEST BLOG POSTS ──────────────────────     │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ Post Title            │ Jan 15, 2026    │    │
│  │ Short excerpt...      │                 │    │
│  │ [tag1] [tag2] [tag3]                    │    │
│  ├─────────────────────────────────────────┤    │
│  │ Post Title            │ Jan 10, 2026    │    │
│  │ Short excerpt...      │                 │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  [Read All Posts →]                              │
│                                                  │
│  ── CTA SECTION ────────────────────────────     │
│                                                  │
│  Let's work together.                            │
│  [Get in Touch]  [Download Resume]               │
│                                                  │
├──────────────────────────────────────────────────┤
│  FOOTER  © 2026 | Social Links | Built with ♥   │
└──────────────────────────────────────────────────┘
```

### Blog List Page

```
┌──────────────────────────────────────────────────┐
│  HEADER                                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  Blog                                            │
│  Thoughts on code, projects, and learning.       │
│                                                  │
│  [All] [TypeScript] [Angular] [DevOps] [...]     │  ← Tag filter
│                                                  │
│  🔍 Search posts...                              │  ← Client-side search
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ ┌────────┐                              │    │
│  │ │ cover  │  Post Title                  │    │
│  │ │ image  │  Jan 15, 2026                │    │
│  │ │        │  Excerpt text goes here...   │    │
│  │ └────────┘  [tag1] [tag2]               │    │
│  ├─────────────────────────────────────────┤    │
│  │ ┌────────┐                              │    │
│  │ │ cover  │  Post Title                  │    │
│  │ │ image  │  Jan 10, 2026                │    │
│  │ │        │  Excerpt text goes here...   │    │
│  │ └────────┘  [tag1] [tag2]               │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
├──────────────────────────────────────────────────┤
│  FOOTER                                          │
└──────────────────────────────────────────────────┘
```

### Blog Post Page

```
┌──────────────────────────────────────────────────┐
│  HEADER                                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  ← Back to Blog                                  │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ Post Title                              │    │
│  │ Jan 15, 2026                            │    │
│  │ [tag1] [tag2] [tag3]                    │    │
│  │                                          │    │
│  │ ┌─────────────────────────────────────┐ │    │
│  │ │          Cover Image                │ │    │
│  │ └─────────────────────────────────────┘ │    │
│  │                                          │    │
│  │ ┌─── Table of Contents ──────────────┐ │    │
│  │ │ 1. Introduction                     │ │    │
│  │ │ 2. Architecture                     │ │    │
│  │ │ 3. Implementation                   │ │    │
│  │ │ 4. Conclusion                       │ │    │
│  │ └────────────────────────────────────┘ │    │
│  │                                          │    │
│  │ ## Introduction                         │    │
│  │                                          │    │
│  │ Article content rendered from HTML...    │    │
│  │                                          │    │
│  │ ```typescript                            │    │
│  │ @Controller('hello')                     │    │
│  │ export class HelloController {           │    │
│  │   @Get()                                 │    │
│  │   getHello(): string {                   │    │
│  │     return 'world';                      │    │
│  │   }                                      │    │
│  │ }                                        │    │
│  │ ```                                      │    │
│  │                                          │    │
│  │ More content...                          │    │
│  │                                          │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ── Share ──                                     │
│  [Twitter] [LinkedIn] [Copy Link]                │
│                                                  │
│  ── More Posts ──                                 │
│  ← Previous Post    |    Next Post →             │
│                                                  │
├──────────────────────────────────────────────────┤
│  FOOTER                                          │
└──────────────────────────────────────────────────┘
```

### Admin Dashboard Page

```
┌──────────────────────────────────────────────────┐
│  HEADER                                          │
├──────────────────────────────────────────────────┤
│  Login View (Unauthenticated):                   │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │         Admin Login                     │    │
│  │                                         │    │
│  │  Password: [****************]          │    │
│  │                                         │    │
│  │  [Login]                                │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  Dashboard View (Authenticated):                 │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Admin Dashboard                    [Logout]│  │
│  ├────────────────────────────────────────────┤  │
│  │                                            │  │
│  │  [+ New Post]                              │  │
│  │                                            │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ Draft: My New Post              [Edit]│  │  │
│  │  │ Created: Jan 15, 2026            [Del]│  │  │
│  │  │ Status: Draft                           │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ Published: Building Microservices [Edit]│  │
│  │  │ Date: Jan 10, 2026               [Del]│  │  │
│  │  │ Status: Published                       │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│  FOOTER                                          │
└──────────────────────────────────────────────────┘
```

### Blog Post Editor Page

```
┌──────────────────────────────────────────────────┐
│  HEADER                                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  ← Back to Dashboard               [Save]  │  │
│  ├────────────────────────────────────────────┤  │
│  │                                            │  │
│  │  Title: [Blog Post Title              ]   │  │
│  │                                            │  │
│  │  Slug: [blog-post-slug                    ]│  │
│  │                                            │  │
│  │  Date: [2026-01-15]  Updated: [2026-01-20] │  │
│  │                                            │  │
│  │  Tags: [typescript, nodejs, nestjs       ]│  │
│  │                                            │  │
│  │  Excerpt: [Brief description...           ]│  │
│  │                                            │  │
│  │  Cover Image: [Upload / URL               ]│  │
│  │                                            │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ ## Markdown Editor                  │  │  │
│  │  │                                     │  │  │
│  │  │ Write your content here using       │  │  │
│  │  │ standard Markdown syntax...         │  │  │
│  │  │                                     │  │  │
│  │  │ ```typescript                       │  │  │
│  │  │ const app = await NestFactory.      │  │  │
│  │  │   create(AppModule);                │  │  │
│  │  │ ```                                 │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                            │  │
│  │  [Preview]  [Save Draft]  [Publish]        │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│  FOOTER                                          │
└──────────────────────────────────────────────────┘
```

---

## Admin Authentication

### Authentication Strategy

Since this is a single-admin portfolio site, use simple password-based authentication:

- **Storage:** Admin password hash stored in environment variable (`ADMIN_PASSWORD_HASH`)
- **Session:** JWT token stored in HTTP-only cookie
- **Security:** Rate limiting on login attempts (5 per minute per IP)

### Admin Environment Variables

```
ADMIN_PASSWORD_HASH=bcrypt_hash_here    # bcrypt hash of admin password
ADMIN_JWT_SECRET=random_secret_here     # JWT signing secret
ADMIN_SESSION_HOURS=24                  # Token expiry
```

### Admin Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/admin/login | No | Authenticate admin, set JWT cookie |
| POST | /api/admin/logout | Yes | Clear JWT cookie |
| GET | /api/admin/verify | Yes | Verify token validity |
| GET | /api/admin/posts | Yes | List all posts (including drafts) |
| POST | /api/admin/posts | Yes | Create new blog post (creates directory) |
| PUT | /api/admin/posts/:slug | Yes | Update existing post |
| DELETE | /api/admin/posts/:slug | Yes | Delete post (removes entire directory) |
| POST | /api/admin/posts/:slug/images | Yes | Upload image to post directory |

### Blog Post Admin Data Schema

```typescript
interface BlogPostForm {
  title: string;           // required, min 3 chars
  slug: string;            // required, URL-friendly
  date: string;            // ISO date
  updated?: string;        // ISO date (optional)
  excerpt: string;         // required, max 300 chars
  tags: string[];          // array of tag strings
  coverImage?: string;     // filename only, e.g. "cover.webp"
  content: string;         // markdown content
  published: boolean;      // draft or published
}

interface ImageUploadForm {
  file: File;              // image file (jpg, png, webp, svg, gif)
  filename: string;        // desired filename
}

interface AdminPostResponse {
  success: boolean;
  message: string;
  post?: BlogPostMetadata;
}
```

### Content Storage Strategy

**Directory-Based Organization**
Each blog post lives in its own directory under `content/blog/{slug}/`:
```
content/blog/
├── hello-world/
│   ├── index.md          # Post content
│   └── cover.webp        # Cover image
└── my-tutorial/
    ├── index.md
    ├── cover.webp
    ├── screenshot-1.png
    └── diagram.svg
```

**Option A: Git-based (Recommended for developer workflow)**
- Admin API creates/updates directories in `content/blog/`
- Each post = one directory containing `index.md` + images
- Trigger git commit + push via GitHub API
- CI/CD pipeline deploys to the server on git push
- *Pros:* Version control, free, organized assets, matches existing architecture
- *Cons:* Delayed updates (requires rebuild)

**Option B: Database + Build-time fetch**
- Store posts in lightweight DB (Turso, PlanetScale, or PostgreSQL)
- Store images in cloud storage (S3, Cloudinary)
- Build script fetches posts from DB during build
- *Pros:* Instant save, no git integration needed
- *Cons:* Adds DB dependency, complexity, separate image storage

**Recommended: Option A with GitHub Integration**

```
Admin writes post → API creates directory → GitHub API commits directory →
CI/CD deploy runs on server → New post live with all images
```

### Admin Security Considerations

- **Password Storage:** Use bcrypt hash (never store plain text)
- **Rate Limiting:** 5 login attempts per minute per IP
- **Session Security:** HTTP-only cookies, secure in production
- **CSRF Protection:** Not needed with HTTP-only cookies + same-origin
- **Content Validation:** Sanitize all inputs server-side
- **File Safety:** Validate slug format to prevent path traversal
- **Image Validation:** Validate file types (jpg, png, webp, svg), max size (5MB)
- **Audit Trail:** Git commits provide automatic audit trail
- **Backup:** Git history provides content backup

---

## API Endpoints

### NestJS API (persistent Node.js server)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/blog | List all published blog posts (metadata) |
| GET | /api/blog/:slug | Get full blog post by slug |
| GET | /api/blog/tags | Get all unique tags |
| GET | /api/projects | List all projects |
| GET | /api/projects/:id | Get project details |
| POST | /api/contact | Submit contact form |
| GET | /api/admin/verify | Verify admin authentication |
| POST | /api/admin/login | Admin login |
| POST | /api/admin/posts | Create new blog post directory (authenticated) |
| PUT | /api/admin/posts/:slug | Update blog post (authenticated) |
| DELETE | /api/admin/posts/:slug | Delete post directory (authenticated) |
| GET | /api/admin/posts | List all posts including drafts (authenticated) |
| POST | /api/admin/posts/:slug/images | Upload image to post directory (authenticated) |

### Contact Form Request

```typescript
interface ContactRequest {
  name: string;       // min 2 chars
  email: string;      // valid email
  subject: string;    // min 5 chars
  message: string;    // min 20 chars
  honeypot?: string;  // spam trap - must be empty
}
```

### Contact Form Response

```typescript
interface ContactResponse {
  success: boolean;
  message: string;
}
```

---

## SEO Strategy

### Meta Tags (per page via `seo.service.ts`)

- `<title>` - Unique per page
- `<meta name="description">` - Page-specific description
- `<meta name="keywords">` - Relevant keywords
- `<link rel="canonical">` - Canonical URL
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card tags (twitter:card, twitter:title, twitter:image)
- JSON-LD structured data (Person, BlogPosting, WebSite)

### Angular SSR Prerendering

Prerender these routes at build time for instant loading:
- `/` (home)
- `/projects` (projects list)
- `/about`
- `/contact`
- `/blog` (blog list)
- `/blog/:slug` (each blog post - dynamically discovered)

### Performance Targets (Lighthouse)

| Metric | Target |
|--------|--------|
| Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |

---

## Design System

### Colors (CSS Custom Properties)

```css
/* Dark theme */
--bg-primary: #0f172a;
--bg-secondary: #1e293b;
--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--accent: #60a5fa;          /* Blue-400 */
--accent-hover: #93c5fd;    /* Blue-300 */
--border: #334155;
--code-bg: #0d1117;
```

### Typography

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
```

### Spacing (8px grid)

All spacing uses multiples of 8px via Tailwind utilities.

### Animations

```typescript
// Shared Angular animations
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const staggerFadeIn = trigger('staggerFadeIn', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(100, [
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);
```

Use `IntersectionObserver` (or a directive) to trigger animations on scroll-into-view.

### Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px    /* Mobile landscape */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large desktop */
```

### Theme

- Dark theme only
- Implemented via CSS class on `<html>` element (`class="dark"`)
- Tailwind `darkMode: 'class'`

---

## Server Deployment Configuration

### Deployment Goal

- Single Linux server running all services with Docker Compose
- Caddy as reverse proxy with automatic TLS
- No serverless runtimes
- Frontend and backend run as persistent containers

### Runtime Topology (Docker + Caddy)

- `caddy` container:
  - Public entrypoint (`80` / `443`)
  - Routes `/` to frontend SSR container
  - Routes `/api/*` to NestJS API container
- `frontend` container:
  - Runs Angular SSR server (`node dist/frontend/server/server.mjs`)
  - Internal port: `4000`
- `api` container:
  - Runs NestJS API (`node dist/main.js`)
  - Internal port: `3000`

### Deployment Files

Create a `deploy/` directory with:

```
deploy/
├── docker-compose.yml
├── caddy/
│   └── Caddyfile
└── .env.production
```

### Example `docker-compose.yml`

```yaml
services:
  caddy:
    image: caddy:2.10-alpine
    container_name: portfolio-caddy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deploy/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - frontend
      - api
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    container_name: portfolio-frontend
    env_file:
      - ./deploy/.env.production
    expose:
      - "4000"
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: api/Dockerfile
    container_name: portfolio-api
    env_file:
      - ./deploy/.env.production
    expose:
      - "3000"
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

### Example Caddy Routing (`Caddyfile`)

```caddy
yourdomain.com, www.yourdomain.com {
    encode zstd gzip

    handle /api/* {
        reverse_proxy api:3000
    }

    handle {
        reverse_proxy frontend:4000
    }
}
```

### Build Pipeline

```
npm run build
  ├── 1. npm run build:content     # Process markdown → JSON
  ├── 2. npm run build:api         # Bundle NestJS API for Node runtime
  └── 3. npm run build:frontend    # ng build (SSR + prerender)
```

### Environment Variables (Server)

```
RESEND_API_KEY=re_xxxx          # Email service
CONTACT_EMAIL=your@email.com    # Where to receive emails
SITE_URL=https://yourdomain.com # Canonical URL
ADMIN_PASSWORD_HASH=...         # Bcrypt hash
ADMIN_JWT_SECRET=...            # Strong random secret
ADMIN_SESSION_HOURS=24          # Session expiration
GITHUB_TOKEN=...                # Admin GitHub integration token (optional)
GITHUB_REPO=user/repo           # Repo for content commits (optional)
GITHUB_BRANCH=main              # Target branch (optional)
```

### Deployment Commands (Server)

```bash
# First-time setup
docker compose -f deploy/docker-compose.yml up -d --build

# Routine updates
git pull
npm install
npm run build
docker compose -f deploy/docker-compose.yml up -d --build

# Health checks
curl -f https://yourdomain.com/
curl -f https://yourdomain.com/api/health
```

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Project setup (npm workspace, Angular CLI, Tailwind)
- [ ] Content pipeline (markdown → JSON build script)
- [ ] Layout (header, footer, routing)
- [ ] Home page (hero, CTA sections)

### Week 2: Core Pages
- [ ] Projects page (list + detail views)
- [ ] Blog page (list + post views with generated content)
- [ ] About page
- [ ] Skills display component

### Week 3: Polish & Deploy
- [ ] Contact form + NestJS API + Resend email
- [ ] SEO (meta tags, JSON-LD, sitemap, Open Graph)
- [ ] Animations & transitions
- [ ] Dark theme polish
- [ ] Responsive testing
- [ ] Server deployment (frontend + API + reverse proxy + SSL)
- [ ] Performance optimization (Lighthouse 95+)

---

## Key Technical Decisions

**Why Node.js + NestJS for a portfolio?**
- Demonstrates enterprise-grade backend architecture patterns
- NestJS provides excellent TypeScript support and modular architecture
- TypeScript end-to-end (content build script, API, frontend)
- Shows versatility - industry-standard tools for both complex and simple projects
- Built-in support for validation, dependency injection, and modular structure

**Why build-time content processing?**
- Blog content is static - no reason to parse markdown on every request
- Enables prerendering all blog pages for maximum SEO
- Syntax highlighting (Shiki) is too expensive to run per-request
- Generated JSON files are served by the frontend server

**Why no database?**
- Portfolio content doesn't need dynamic storage
- Markdown files are version-controlled with git
- Simpler deployment (no DB provisioning)
- Lower operational complexity and low server cost

**Why Angular SSR over prerendering only?**
- SSR handles dynamic routes (future growth)
- Better meta tag management per-page
- Contact form needs server-side handling anyway
- Demonstrates SSR skills on your resume

**Why Tailwind CSS over Angular Material?**
- Portfolio design should be custom and unique, not look like a Material app
- Tailwind gives full design control
- Lighter bundle size for a content site
- Better suited for custom animations and layouts
