---
title: "Hello World - Building My Developer Portfolio"
slug: "hello-world"
date: "2026-02-11"
tags: ["portfolio", "angular", "nestjs", "tutorial"]
excerpt: "Welcome to my new developer portfolio! In this post, I'll share the journey of building this site using Angular, NestJS, and modern web technologies."
published: true
featured: true
coverImage: "./cover.webp"
---

# Hello World!

Welcome to my new developer portfolio! This is the first blog post on my freshly built portfolio site. I'm excited to share the journey of how I built this platform and what you can expect to find here.

## Why I Built This Portfolio

As a developer, having a personal portfolio is essential. It's not just a showcase of projects—it's a place to:

- Share my learning journey through blog posts
- Display my technical skills and projects
- Connect with other developers and potential employers
- Experiment with new technologies

## Tech Stack Overview

This portfolio is built with a modern, full-stack architecture:

### Frontend
- **Angular 21** with standalone components and SSR
- **Tailwind CSS 4** for styling
- **Lucide Angular** for beautiful icons
- Server-side rendering for better SEO and performance

### Backend
- **NestJS** for the API layer
- **TypeScript** throughout the entire stack
- JWT authentication for the admin dashboard
- Rate limiting and security best practices

### Content Pipeline
- Markdown files with YAML frontmatter
- Build-time processing with gray-matter and marked
- Syntax highlighting with Shiki
- Static JSON generation for optimal performance

## Code Example

Here's a simple example of how the content pipeline works:

```typescript
// Example: Processing a blog post
import matter from 'gray-matter';
import { marked } from 'marked';

async function processPost(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data: frontmatter, content: markdown } = matter(content);
  
  const html = await marked(markdown);
  
  return {
    meta: frontmatter,
    content: html
  };
}
```

## What's Next?

In upcoming posts, I'll dive deeper into:

1. **Building the Content Pipeline** - How I process markdown at build time
2. **Angular SSR Configuration** - Setting up server-side rendering for SEO
3. **NestJS API Design** - Creating a secure and scalable backend
4. **Admin Dashboard** - Building a custom CMS for blog management

## Getting Started

If you're interested in building something similar, the entire codebase is open source on GitHub. Feel free to explore, fork, and adapt it for your own portfolio!

```bash
# Clone the repository
git clone https://github.com/NachoOsella/PortFolio.git

# Install dependencies
npm install

# Run the development server
npm run dev
```

## Conclusion

Building this portfolio has been an incredible learning experience. From configuring Angular SSR to implementing a custom markdown pipeline, every step taught me something new.

I'm looking forward to sharing more technical insights and project showcases here. Stay tuned!

---

*Thanks for reading! If you have any questions or feedback, feel free to reach out through the contact form or connect with me on social media.*