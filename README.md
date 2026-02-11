# Developer Portfolio & Blog

[![Angular](https://img.shields.io/badge/Angular-21.1-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white)](https://vercel.com/)

A modern, performant full-stack developer portfolio with an integrated blog, built with **Angular 21**, **NestJS**, and **Tailwind CSS 4**. Features server-side rendering (SSR) for SEO, a custom markdown-based content pipeline, and a secure admin dashboard for content management.

![Portfolio Preview](./assets/preview.png)

## ✨ Features

### 🎨 Frontend (Angular)
- **Server-Side Rendering (SSR)** - Optimal SEO and performance
- **Standalone Components** - Modern Angular architecture
- **Tailwind CSS 4** - Utility-first styling with dark mode support
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Angular animations with scroll-triggered effects
- **Type-Safe** - Full TypeScript implementation

### ⚡ Backend (NestJS)
- **RESTful API** - Clean, scalable architecture
- **JWT Authentication** - Secure admin access
- **Rate Limiting** - Protection against abuse
- **Email Service** - Contact form with Resend integration
- **Input Validation** - class-validator DTOs
- **CORS Configured** - Secure cross-origin requests

### 📝 Content Pipeline
- **Markdown-Based** - Write blog posts in Markdown with YAML frontmatter
- **Build-Time Processing** - Markdown → HTML with syntax highlighting
- **Shiki Highlighting** - Beautiful code blocks with multiple themes
- **Reading Time** - Automatic calculation
- **Table of Contents** - Auto-generated from headings
- **Image Optimization** - Automatic asset handling

### 🛠️ Admin Dashboard
- **Secure Login** - JWT-based authentication
- **Post Editor** - Write and edit blog posts
- **Image Upload** - Drag-and-drop image support
- **Draft/Publish** - Workflow for content management
- **GitHub Integration** - Auto-commit content changes (Phase 8)

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Angular 21](https://angular.io/) | Modern frontend framework with SSR |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS framework |
| [Lucide Angular](https://lucide.dev/) | Beautiful, consistent icons |
| [RxJS](https://rxjs.dev/) | Reactive programming |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |

### Backend
| Technology | Purpose |
|------------|---------|
| [NestJS](https://nestjs.com/) | Progressive Node.js framework |
| [Passport](http://www.passportjs.org/) | Authentication middleware |
| [JWT](https://jwt.io/) | JSON Web Tokens |
| [Resend](https://resend.com/) | Email delivery service |
| [class-validator](https://github.com/typestack/class-validator) | Input validation |

### Content Processing
| Technology | Purpose |
|------------|---------|
| [gray-matter](https://github.com/jonschlinkert/gray-matter) | YAML frontmatter parsing |
| [marked](https://marked.js.org/) | Markdown parser |
| [Shiki](https://shiki.matsu.io/) | Syntax highlighter |
| [reading-time](https://github.com/ngryman/reading-time) | Read time estimation |

## 📁 Project Structure

```
PortFolio/
├── 📂 api/                     # NestJS backend
│   ├── src/
│   │   ├── app.controller.ts   # Health check endpoint
│   │   ├── app.module.ts       # Root module
│   │   └── main.ts             # Application entry
│   ├── package.json
│   └── tsconfig.json
│
├── 📂 frontend/                # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.config.ts   # App configuration
│   │   │   ├── app.routes.ts   # Route definitions
│   │   │   └── app.ts          # Root component
│   │   ├── index.html          # HTML entry with fonts
│   │   ├── main.ts             # Bootstrap
│   │   └── styles.css          # Global styles + Tailwind
│   ├── angular.json
│   └── package.json
│
├── 📂 content/                 # Content source files
│   ├── blog/                   # Blog posts (Markdown)
│   │   └── hello-world/
│   │       └── index.md
│   ├── projects.json           # Project showcase data
│   └── skills.json             # Skills data
│
├── 📂 scripts/                 # Build scripts
│   └── build-content.ts        # Markdown → JSON processor
│
├── 📂 generated/               # Build output (gitignored)
│   ├── blog/
│   │   └── hello-world/
│   │       └── index.json
│   ├── blog-index.json
│   ├── projects.json
│   └── skills.json
│
├── package.json                # Root workspace config
└── README.md                   # This file
```

## 🏁 Quick Start

### Prerequisites
- **Node.js** 20+ (LTS recommended)
- **npm** 10+ or **pnpm**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NachoOsella/PortFolio.git
   cd PortFolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build content**
   ```bash
   npm run build:content
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- 🌐 **Frontend:** http://localhost:4200
- 🔌 **API:** http://localhost:3000/api

### Build for Production

```bash
# Build everything (content + API + frontend)
npm run build

# Output:
# - Content: generated/
# - API: api/dist/
# - Frontend: frontend/dist/frontend/
```

## 📝 Content Management

### Writing Blog Posts

Blog posts are written in Markdown with YAML frontmatter:

```markdown
---
title: "My Awesome Post"
slug: "my-awesome-post"
date: "2026-02-11"
tags: ["angular", "tutorial"]
excerpt: "A brief summary of the post"
published: true
featured: true
coverImage: "./cover.webp"
---

# My Awesome Post

Write your content here using **Markdown** syntax.

## Code Example

```typescript
// Your code here
const greeting = 'Hello, World!';
```
```

Save your post in `content/blog/{slug}/index.md` and run `npm run build:content`.

### Adding Projects

Edit `content/projects.json`:

```json
{
  "id": "my-project",
  "title": "My Project",
  "description": "Short description",
  "technologies": ["Angular", "NestJS"],
  "featured": true,
  "links": {
    "live": "https://example.com",
    "github": "https://github.com/user/repo"
  }
}
```

### Managing Skills

Edit `content/skills.json` to update your tech stack.

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Import your repository on [Vercel](https://vercel.com)
   - Set framework preset to "Other"
   - Configure build command: `npm run build`
   - Set output directory: `frontend/dist/frontend`

3. **Environment Variables**
   Add these in Vercel dashboard:
   - `RESEND_API_KEY`
   - `CONTACT_EMAIL`
   - `ADMIN_PASSWORD_HASH`
   - `ADMIN_JWT_SECRET`
   - `SITE_URL`

4. **Deploy!**
   Vercel will automatically deploy on every push to `main`.

## 📊 Content Pipeline Architecture

```
Markdown Files (.md)
       │
       ▼
┌──────────────────┐
│  Build Script    │
│  (build-content) │
│                  │
│  • gray-matter   │ ← Parse frontmatter
│  • marked        │ ← MD → HTML
│  • shiki         │ ← Syntax highlight
│  • reading-time  │ ← Calculate read time
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generated JSON  │
│                  │
│  blog-index.json │ ← Metadata only (listings)
│  blog/{slug}/    │ ← Full posts (content + metadata)
│  projects.json   │
│  skills.json     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Angular SSR     │
│  (Server/API)    │
│                  │
│  • Fast loads    │
│  • SEO-friendly  │
│  • CDN cacheable │
└──────────────────┘
```

## 🛣️ Roadmap

### Phase 1: Foundation ✅
- [x] Repository & workspace setup
- [x] NestJS API with health check
- [x] Angular frontend with SSR
- [x] Content pipeline (Markdown → JSON)

### Phase 2: Core Infrastructure 🔄
- [x] App configuration (HttpClient, Router, Animations, SSR)
- [ ] Routing setup
- [ ] Core services (API, SEO, Theme)
- [ ] Layout components (Header, Footer)
- [ ] Shared components

### Phase 3: Home Page
- [ ] Hero section
- [ ] Featured projects
- [ ] Skills overview
- [ ] Latest blog posts

### Phase 4: Content Pages
- [ ] Projects list & detail
- [ ] Blog list & post pages
- [ ] About page
- [ ] Contact form
- [ ] Admin dashboard

### Phase 5: API Development
- [ ] Contact endpoint
- [ ] Blog endpoints
- [ ] Projects endpoints
- [ ] Admin authentication

### Phase 6: SEO & Performance
- [ ] Meta tags & Open Graph
- [ ] JSON-LD structured data
- [ ] Sitemap generation
- [ ] Performance optimization

### Phase 7: Polish & UX
- [ ] Dark mode
- [ ] Responsive design
- [ ] Animations
- [ ] Accessibility

### Phase 8: Deployment
- [ ] Vercel configuration
- [ ] Custom domain
- [ ] GitHub integration
- [ ] Analytics

## 🧪 Testing

```bash
# Run frontend tests
cd frontend && npm test

# Run API tests
cd api && npm test

# Run all tests
npm test
```

## 📖 Documentation

- [NestJS Docs](https://docs.nestjs.com)
- [Angular Docs](https://angular.dev)
- [Angular SSR Guide](https://angular.dev/guide/ssr)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Shiki Syntax Highlighter](https://shiki.matsu.io)

## 🤝 Contributing

This is a personal portfolio project, but feel free to fork and adapt it for your own use! If you find bugs or have suggestions, please open an issue.

## 📄 License

MIT License - feel free to use this project as a template for your own portfolio!

---

<p align="center">
  Built with ❤️ using <a href="https://angular.io/">Angular</a>, <a href="https://nestjs.com/">NestJS</a>, and <a href="https://tailwindcss.com/">Tailwind CSS</a>
</p>

<p align="center">
  <a href="https://github.com/NachoOsella">GitHub</a> •
  <a href="https://linkedin.com/in/yourprofile">LinkedIn</a> •
  <a href="mailto:your.email@example.com">Email</a>
</p>