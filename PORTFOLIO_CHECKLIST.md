# Developer Portfolio & Blog - Implementation Checklist

Use this file to track your progress. Check off items as you complete them.

**Legend:**
- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked/Issue

---

## Phase 1: Project Setup & Foundation

### 1.1 Repository & Workspace Setup
- [x] Create project root directory
- [x] Initialize Git repository
- [x] Create `.gitignore` (node_modules, dist, .env, generated/)
- [x] Initialize npm workspace (`npm init` + configure workspaces in root `package.json`)
- [x] Create workspace directories:
  - [x] `api/` (NestJS backend)
  - [x] `frontend/` (Angular app)
  - [x] `content/` (Markdown & data files)
  - [x] `scripts/` (Build scripts)
  - [x] `generated/` (Build output, gitignored)
- [x] Create root `package.json` with workspace scripts:
  - [x] `build:content` - Process markdown
  - [x] `build:api` - Bundle API
  - [x] `build:frontend` - Build Angular
  - [x] `build` - Run all three in sequence
  - [x] `dev` - Run API + frontend concurrently
- [x] Create `.env.example` with required variables

### 1.2 NestJS API Setup
- [x] Create `api/package.json` with dependencies:
  - [x] @nestjs/core
  - [x] @nestjs/common
  - [x] @nestjs/platform-express
  - [x] @nestjs/config
  - [x] @nestjs/throttler (rate limiting)
  - [x] @nestjs/passport (authentication)
  - [x] @nestjs/jwt (JWT tokens)
  - [x] passport (authentication)
  - [x] passport-jwt (JWT strategy)
  - [x] bcrypt (password hashing)
  - [x] @octokit/rest (GitHub API - Phase 8.3)
  - [x] class-validator (validation)
  - [x] class-transformer
  - [x] resend (email service)
- [x] Create `api/tsconfig.json`
- [x] Create `api/src/main.ts` - Main NestJS entry
- [x] Create `api/src/app.module.ts` - Root module
- [x] Initialize NestJS app with CORS
- [x] Create health check endpoint: `GET /api/health`
- [x] Test: `npm run start:api` starts correctly

### 1.3 Angular Frontend Setup
- [x] Install Angular CLI: `npm install -g @angular/cli`
- [x] Create Angular project: `ng new frontend --style=css --ssr`
  - [x] Enable SSR
  - [x] Enable standalone components
  - [x] Enable strict mode
- [x] Install Tailwind CSS 4:
  - [x] `npm install -D tailwindcss @tailwindcss/postcss postcss`
  - [x] Create `postcss.config.js`
  - [x] Add Tailwind directives to `styles.css`
- [x] Install additional packages:
  - [x] `lucide-angular` (icons)
- [x] Configure `angular.json`:
  - [x] Set output path
  - [x] Configure SSR settings
- [x] Install fonts (Inter + JetBrains Mono):
  - [x] Add to `index.html`
- [x] Test: `ng build` completes successfully with Tailwind working

### 1.4 Content Pipeline Setup
- [x] Create `scripts/build-content.ts`
- [x] Install content processing dependencies (in root or scripts):
  - [x] `gray-matter` (frontmatter parsing)
  - [x] `marked` (Markdown → HTML)
  - [x] `shiki` (syntax highlighting)
  - [x] `reading-time` (calculate read time)
  - [x] `tsx` (TypeScript execution)
- [x] Create sample blog post: `content/blog/hello-world/`
  - [x] Create directory: `content/blog/hello-world/`
  - [x] Add `index.md` with frontmatter (title, slug, date, tags, excerpt, published)
  - [x] Add sample content with code blocks
- [x] Create `content/projects.json` with 1-2 sample projects
- [x] Create `content/skills.json` with skill categories
- [x] Implement build script:
  - [x] Scan `content/blog/` for directories (each directory = one post)
  - [x] Read `index.md` from each post directory
  - [x] Parse frontmatter with `gray-matter`
  - [x] Resolve relative image paths
  - [x] Copy post images to `generated/blog/{slug}/` directory
  - [x] Convert markdown to HTML with `marked`
  - [x] Apply syntax highlighting with `shiki`
  - [x] Calculate reading time
  - [x] Extract table of contents from headings
  - [x] Generate `generated/blog-index.json` (metadata only)
  - [x] Generate `generated/blog/{slug}/index.json` (full content + metadata)
  - [x] Copy `projects.json` and `skills.json` to `generated/`
- [x] Test: `npm run build:content` produces correct output
- [x] Add `generated/` to `.gitignore`

---

## Phase 2: Layout & Core Infrastructure

### 2.1 Angular App Configuration
- [x] Create `app.config.ts` (standalone config):
  - [x] Configure HttpClient with `provideHttpClient(withFetch())`
  - [x] Configure Router with `provideRouter(routes)`
  - [x] Configure Angular animations
  - [x] Configure SSR transfer state
- [x] Create `app.routes.ts`:
  - [x] `/` → Home (eager)
  - [x] `/projects` → Projects list (lazy)
  - [x] `/projects/:id` → Project detail (lazy)
  - [x] `/blog` → Blog list (lazy)
  - [x] `/blog/:slug` → Blog post (lazy)
  - [x] `/about` → About (lazy)
  - [x] `/contact` → Contact (lazy)
  - [x] `/admin` → Admin Dashboard (lazy, guarded)
  - [x] `/admin/login` → Admin Login (lazy)
  - [x] `/admin/new` → New Post Editor (lazy, guarded)
  - [x] `/admin/edit/:slug` → Edit Post (lazy, guarded)
  - [x] `**` → 404 redirect to home

### 2.2 Core Services
- [x] Create `core/services/api.service.ts`
  - [x] Inject `HttpClient`
  - [x] Base URL configuration (environment-based)
  - [x] GET method with generic typing
  - [x] POST method with generic typing
  - [x] Error handling (catchError, retry)
- [x] Create `core/services/seo.service.ts`
  - [x] Inject `Title`, `Meta` services
  - [x] `updateTitle(title: string)` method
  - [x] `updateMetaTags(config)` method
  - [x] `setOpenGraph(config)` method
  - [x] `setTwitterCard(config)` method
  - [x] `setJsonLd(data)` method (structured data)
- [x] Create `core/services/theme.service.ts`
  - [x] Enforce dark mode globally
  - [x] Apply `dark` class to `<html>`
  - [x] Expose `isDark$` observable (BehaviorSubject)
- [x] Create `core/interceptors/error.interceptor.ts`
  - [x] Log errors
  - [x] Handle common HTTP errors

### 2.3 Layout Components
- [x] Create `layout/layout.component.ts`
  - [x] Shell component with header + main + footer
  - [x] Router outlet in main area
- [x] Create `layout/header/header.component.ts`
  - [x] Logo/name (links to home)
  - [x] Navigation links: Home, Projects, Blog, About, Contact
  - [x] Resume download link
  - [x] Mobile hamburger menu
  - [x] Mobile slide-out navigation
  - [x] Sticky header with backdrop blur on scroll
  - [x] Active route highlighting
- [x] Create `layout/footer/footer.component.ts`
  - [x] Copyright notice
  - [x] Social links (GitHub, LinkedIn, Twitter/X, Email)
  - [x] "Built with" tech credits
  - [x] Quick navigation links

### 2.4 Shared Components
- [x] Create `shared/components/project-card.component.ts`
  - [x] Project image/thumbnail
  - [x] Title and short description
  - [x] Technology tags
  - [x] Links (live, GitHub)
  - [x] Hover effect / animation
- [x] Create `shared/components/blog-card.component.ts`
  - [x] Cover image (optional)
  - [x] Title
  - [x] Date
  - [x] Excerpt
  - [x] Tags
  - [x] Hover effect
- [x] Create `shared/components/skill-badge.component.ts`
  - [x] Icon + name
  - [x] Optional proficiency indicator
  - [x] Tooltip with details
- [x] Create `shared/components/tag-filter.component.ts`
  - [x] List of tag buttons
  - [x] Active state styling
  - [x] Emit selected tag
  - [x] "All" option
- [x] Create `shared/components/back-to-top.component.ts`
  - [x] Show after scrolling 300px
  - [x] Smooth scroll to top
  - [x] Fade in/out animation
- [x] Create `shared/components/section-heading.component.ts`
  - [x] Consistent heading style across pages
  - [x] Optional subtitle
- [x] Create `shared/components/markdown-editor.component.ts` (for admin)
  - [x] Textarea for markdown input
  - [x] Toolbar with common markdown shortcuts (bold, italic, code, link)
  - [x] Word count display
  - [x] Auto-resize or fixed height options
  - [x] Tab key support for indentation
- [x] Create `shared/components/markdown-preview.component.ts` (for admin)
  - [x] Render markdown to HTML preview
  - [x] Syntax highlighting in preview
  - [x] Sync scroll with editor (optional)

---

## Phase 3: Home Page

### 3.1 Home Page Component
- [x] Create `pages/home/home.component.ts`
  - [x] Compose sections
  - [x] Set SEO meta tags (title, description, og tags)
  - [x] Load featured projects and latest posts data

### 3.2 Hero Section
- [x] Create `pages/home/sections/hero.component.ts`
  - [x] Greeting text with your name
  - [x] Title/role ("Full-Stack Developer")
  - [x] Short tagline (1-2 sentences about what you do)
  - [x] CTA buttons: "View Projects" + "Read Blog"
  - [x] Social media links (GitHub, LinkedIn, Twitter/X)
  - [x] Subtle entrance animation (fade in + slide up)
  - [~] Optional: animated typing effect for tagline
  - [~] Optional: gradient text or accent color highlights
  - [x] Responsive: stack vertically on mobile

### 3.3 Featured Projects Section
- [x] Create `pages/home/sections/featured-projects.component.ts`
  - [x] Section heading: "Featured Projects"
  - [x] Display 3 featured projects (from projects.json where `featured: true`)
  - [x] Use `project-card` shared component
  - [x] Grid layout: 3 columns desktop, 2 tablet, 1 mobile
  - [~] Staggered fade-in animation on scroll
  - [x] "View All Projects →" link at bottom

### 3.4 Skills Overview Section
- [x] Create `pages/home/sections/skills-overview.component.ts`
  - [x] Section heading: "Tech Stack"
  - [x] Load skills from `skills.json`
  - [x] Display by category (Languages, Frontend, Backend, DevOps)
  - [x] Use `skill-badge` components
  - [x] Grid or flex layout
  - [~] Fade-in animation on scroll

### 3.5 Latest Blog Posts Section
- [x] Create `pages/home/sections/latest-posts.component.ts`
  - [x] Section heading: "Latest Posts"
  - [x] Display 3 most recent blog posts
  - [x] Use `blog-card` shared component
  - [x] "Read All Posts →" link at bottom
  - [~] Staggered animation

### 3.6 CTA Section
- [x] Create `pages/home/sections/cta.component.ts`
  - [x] Call-to-action text: "Interested in collaborating?"
  - [x] Buttons: "Get in Touch" + "Download Resume"
  - [x] Background accent color or subtle gradient
  - [x] Clean, centered layout

---

## Phase 4: Content Pages

### 4.1 Projects Page
- [x] Create `pages/projects/projects-list.component.ts`
  - [x] Page title: "Projects"
  - [x] Set SEO meta tags
  - [x] Load projects from API or generated JSON
  - [~] Tag filter component (filter by technology)
  - [x] Grid of project cards
  - [ ] Filter animation (fade out/in filtered items)
  - [x] Categories: "All", "Frontend", "Backend", "Full-Stack", etc.
  - [x] Responsive grid: 3→2→1 columns

### 4.2 Project Detail Page
- [x] Create `pages/projects/project-detail.component.ts`
  - [x] Route: `/projects/:id`
  - [x] Set SEO meta tags per project
  - [x] Large project image/screenshot
  - [x] Title + description
  - [x] Technology tags
  - [x] Highlights list (bullet points of key features)
  - [x] Links: Live Demo, GitHub Repo
  - [x] "← Back to Projects" link
  - [x] Related projects section (same tags)

### 4.3 Blog List Page
- [x] Create `pages/blog/blog-list.component.ts`
  - [x] Page title: "Blog"
  - [x] Subtitle: "Thoughts on code, projects, and learning"
  - [x] Set SEO meta tags
  - [x] Load blog index from generated JSON
  - [x] Tag filter component (filter by tag)
  - [x] Client-side search (filter by title/excerpt)
  - [x] List of blog cards
  - [x] Sort by date (newest first)
  - [x] Responsive layout

### 4.4 Blog Post Page
- [x] Create `pages/blog/blog-post.component.ts`
  - [x] Route: `/blog/:slug`
  - [x] Set SEO meta tags per post (title, description, og:image)
  - [x] Set JSON-LD structured data (BlogPosting schema)
  - [x] "← Back to Blog" link
  - [x] Post title + date + reading time
  - [x] Tags
  - [x] Cover image (optional)
  - [x] Table of contents (from generated TOC data)
    - [x] Sticky sidebar on desktop
    - [x] Collapsible on mobile
    - [x] Active section highlighting on scroll
  - [x] Article content (rendered HTML from generated JSON)
  - [x] Code blocks with syntax highlighting (pre-generated by Shiki)
  - [ ] Copy code button on code blocks
  - [x] Typography/prose styling for article content
  - [~] Share buttons: Twitter, LinkedIn, Copy Link
  - [x] Previous/Next post navigation
  - [ ] Scroll progress indicator (optional)

### 4.5 About Page
- [x] Create `pages/about/about.component.ts`
  - [x] Set SEO meta tags
  - [x] Personal photo/avatar
  - [x] Bio text (from `content/about.md` processed to HTML)
  - [x] "What I do" section
  - [ ] Timeline or journey section (optional)
  - [~] Current focus / what I'm learning
  - [ ] Fun facts or personal interests
  - [x] CTA: "Get in touch" + social links
  - [x] Resume download button

### 4.6 Contact Page
- [x] Create `pages/contact/contact.component.ts`
  - [x] Set SEO meta tags
  - [x] Page title: "Get in Touch"
  - [x] Contact form:
    - [x] Name field (required, min 2 chars)
    - [x] Email field (required, valid email)
    - [x] Subject field (required, min 5 chars)
    - [x] Message textarea (required, min 20 chars)
    - [x] Honeypot field (hidden, for spam prevention)
    - [x] Submit button with loading state
  - [x] Form validation with error messages
  - [x] Success message after submission
  - [x] Error message on failure
  - [ ] Rate limiting feedback (prevent spam clicking)
  - [~] Alternative contact methods:
    - [x] Email address
    - [x] Social media links
    - [ ] LinkedIn profile

### 4.7 Admin Pages
- [x] Create admin route guard `pages/admin/admin.guard.ts`
  - [x] Check authentication status on route activation
  - [x] Redirect to login if not authenticated
  - [x] Verify token validity via API
- [x] Create admin auth service `core/services/admin-auth.service.ts`
  - [x] Login method (POST to /api/admin/login)
  - [x] Logout method (POST to /api/admin/logout)
  - [x] Verify auth status (GET /api/admin/verify)
  - [x] Store auth state (BehaviorSubject)
  - [ ] Handle HTTP-only cookie automatically
- [x] Create `pages/admin/admin-login.component.ts`
  - [x] Route: `/admin/login`
  - [x] Password input field
  - [x] Login button with loading state
  - [x] Error message for invalid credentials
  - [x] Redirect to dashboard on success
- [x] Create `pages/admin/admin-dashboard.component.ts`
  - [x] Route: `/admin`
  - [x] Protected by admin guard
  - [x] Display all blog posts (drafts + published)
  - [x] Post status indicators (draft/published)
  - [x] "New Post" button
  - [x] Edit/Delete buttons for each post
  - [x] Confirmation dialog for delete
  - [x] Empty state when no posts exist
- [x] Create `pages/admin/admin-editor.component.ts`
  - [x] Route: `/admin/edit/:slug` (edit) and `/admin/new` (create)
  - [x] Protected by admin guard
  - [x] Form fields:
    - [x] Title input
    - [x] Slug input (auto-generate from title)
    - [x] Date picker (default to today)
    - [x] Tags input (comma-separated)
    - [x] Excerpt textarea
    - [x] Cover image URL input
    - [x] Published checkbox
    - [x] Markdown content textarea (full height)
  - [~] Live preview toggle (rendered markdown)
  - [x] Save Draft button
  - [x] Publish button
  - [ ] Auto-save indicator (optional)
  - [x] Form validation
  - [x] Success/error feedback
  - [x] Discard changes confirmation
- [x] Update `app.routes.ts` with admin routes:
  - [x] `/admin` → Admin Dashboard (guarded)
  - [x] `/admin/login` → Admin Login
  - [x] `/admin/new` → New Post Editor (guarded)
  - [x] `/admin/edit/:slug` → Edit Post (guarded)
- [x] Add link to admin in footer (subtle)

---

## Phase 5: API Development

### 5.1 Contact Endpoint
- [x] Create `api/src/contact/contact.controller.ts`
  - [x] `POST /api/contact` endpoint
  - [x] class-validator DTO:
    - [x] name: string (min 2, max 100)
    - [x] email: string (email format)
    - [x] subject: string (min 5, max 200)
    - [x] message: string (min 20, max 5000)
    - [x] honeypot: string (must be empty)
  - [x] Reject if honeypot field is filled (spam bot)
  - [x] Rate limiting with @nestjs/throttler (max 3 submissions per hour per IP)
- [x] Create `api/src/services/email.service.ts`
  - [x] Configure Resend client
  - [x] Create email sending function
  - [x] HTML email template for contact submissions
  - [x] Send to your configured `CONTACT_EMAIL`
  - [ ] Auto-reply to sender (optional)
- [ ] Test contact endpoint with valid data
- [ ] Test validation rejection
- [ ] Test honeypot spam prevention
- [ ] Test email delivery

### 5.2 Blog API Endpoints
- [x] Create `api/src/blog/blog.controller.ts`
  - [x] `GET /api/blog` - Return blog index (all post metadata)
    - [x] Read from `generated/blog-index.json`
    - [x] Optional: filter by tag query param
    - [ ] Optional: pagination (limit/offset)
  - [x] `GET /api/blog/:slug` - Return full blog post
    - [x] Read from `generated/blog/{slug}.json`
    - [x] Return 404 if not found
  - [x] `GET /api/blog/tags` - Return all unique tags
    - [x] Aggregate from blog index
- [x] Create `api/src/blog/blog.service.ts` for business logic
- [~] Test blog endpoints return correct data

### 5.3 Projects API Endpoints
- [x] Create `api/src/projects/projects.controller.ts`
  - [x] `GET /api/projects` - Return all projects
    - [x] Read from `generated/projects.json`
    - [ ] Optional: filter by category
  - [x] `GET /api/projects/:id` - Return single project
    - [x] Return 404 if not found
- [x] Create `api/src/projects/projects.service.ts` for business logic
- [~] Test project endpoints

### 5.4 Admin API Endpoints
- [x] Create `api/src/admin/admin.controller.ts`
  - [x] `POST /api/admin/login` - Authenticate admin
    - [x] Validate password against hash
    - [x] Generate JWT token
    - [ ] Set HTTP-only cookie
    - [ ] Rate limit: 5 attempts per minute per IP
  - [~] `POST /api/admin/logout` - Clear auth cookie
  - [x] `GET /api/admin/verify` - Check authentication status
  - [x] `GET /api/admin/posts` - List all posts (including drafts)
  - [x] `POST /api/admin/posts` - Create new blog post
    - [x] Validate form data with class-validator DTOs
    - [x] Generate markdown file with frontmatter
    - [x] Save to `content/blog/{slug}/index.md`
    - [x] Return success/error response
  - [x] `PUT /api/admin/posts/:slug` - Update existing post
    - [x] Read existing file
    - [x] Update content and frontmatter
    - [x] Handle slug changes (rename file)
  - [x] `DELETE /api/admin/posts/:slug` - Delete post
    - [x] Remove entire post directory
    - [x] Return confirmation
  - [x] `POST /api/admin/posts/:slug/images` - Upload image
    - [x] Validate file type (jpg, png, webp, svg, gif)
    - [x] Validate file size (max 5MB)
    - [x] Save to post directory
    - [x] Return relative path for markdown
- [x] Create `api/src/admin/admin.service.ts`
  - [x] Password verification function
  - [x] JWT token generation/verification
  - [x] File I/O operations for markdown
  - [x] Frontmatter serialization
  - [x] Directory creation for new posts
  - [x] Image upload handling to post directory
  - [x] Handle relative image path resolution
- [x] Create `api/src/auth/auth.guard.ts`
  - [ ] Verify JWT from cookie using @nestjs/passport
  - [ ] Attach admin status to request
  - [x] Return 401 for unauthenticated requests
- [x] Create `api/src/auth/auth.module.ts`
  - [~] Configure JWT strategy
  - [ ] Configure Passport
- [ ] Add environment variables:
  - [x] `ADMIN_PASSWORD_HASH` - Bcrypt hash
  - [x] `ADMIN_JWT_SECRET` - JWT signing key
  - [x] `ADMIN_SESSION_HOURS` - Token expiry

### 5.5 API Integration
- [x] Register all modules in `api/src/app.module.ts`
  - [x] ContactModule
  - [x] BlogModule
  - [x] ProjectsModule
  - [x] AdminModule
  - [x] AuthModule
- [x] Configure CORS (allow frontend origin)
- [x] Add request logging with @nestjs/common Logger
- [x] Configure global validation pipe
- [ ] Test all endpoints end-to-end
- [x] Configure for traditional server deployment

---

## Phase 6: SEO & Performance

### 6.1 SEO Implementation
- [~] Implement SEO service calls on every page:
  - [x] Home: title, description, og tags
  - [x] Projects list: title, description
  - [x] Project detail: per-project title, description, image
  - [x] Blog list: title, description
  - [x] Blog post: per-post title, description, og:image, JSON-LD
  - [x] About: title, description
  - [x] Contact: title, description
- [ ] Add JSON-LD structured data:
  - [~] Person (on home/about)
  - [x] WebSite (on home)
  - [x] BlogPosting (on each blog post)
  - [x] BreadcrumbList (on inner pages)
- [x] Create `sitemap.xml` generation script
  - [x] Include all static routes
  - [x] Include all blog post routes
  - [x] Set lastmod dates
- [x] Create `robots.txt`
  - [x] Allow all crawlers
  - [x] Point to sitemap.xml
- [ ] Add canonical URLs to all pages
- [ ] Configure Open Graph image (`og-image.png`)
  - [ ] Create default OG image (1200x630)
  - [ ] Per-post OG images (optional)

### 6.2 Angular SSR & Prerendering
- [x] Configure `@angular/ssr`:
  - [x] Server entry point
  - [ ] TransferState for API calls
- [~] Configure prerendering in `angular.json`:
  - [x] Static routes: `/`, `/projects`, `/blog`, `/about`, `/contact`
  - [ ] Dynamic routes: `/blog/:slug` (discover from blog index)
  - [ ] Script to generate prerender routes file
- [ ] Test SSR: `ng serve --ssr`
- [ ] Verify HTML source includes content (not empty shell)
- [ ] Verify meta tags render server-side

### 6.3 Performance Optimization
- [ ] Image optimization:
  - [ ] Use `ngOptimizedImage` directive
  - [ ] Convert images to WebP format
  - [ ] Serve responsive images (srcset)
  - [ ] Lazy load below-fold images
  - [ ] Set explicit width/height to prevent CLS
- [ ] Font optimization:
  - [ ] Preload critical fonts
  - [ ] Use `font-display: swap`
  - [ ] Subset fonts if self-hosting
- [ ] Bundle optimization:
  - [ ] Lazy load route modules
  - [ ] Tree-shake unused code
  - [ ] Analyze bundle size (`ng build --stats-json`)
- [ ] Core Web Vitals:
  - [ ] LCP < 2.5s (optimize hero image/text)
  - [ ] FID < 100ms (minimize JS blocking)
  - [ ] CLS < 0.1 (explicit image dimensions, no layout shifts)
- [ ] Run Lighthouse audit
- [ ] Target: 95+ on all four categories

---

## Phase 7: Polish & UX

### 7.1 Theme
- [x] Enforce dark mode globally
  - [x] Apply CSS class on `<html>`
- [ ] Test all pages in dark theme
- [ ] Ensure sufficient contrast ratios (WCAG AA)

### 7.2 Responsive Design
- [ ] Test all pages at breakpoints:
  - [ ] 320px (small mobile)
  - [ ] 375px (iPhone)
  - [ ] 768px (tablet)
  - [ ] 1024px (desktop)
  - [ ] 1440px (large desktop)
- [ ] Mobile navigation (hamburger menu)
- [ ] Touch-friendly tap targets (min 44px)
- [ ] Readable font sizes on mobile (min 16px body)
- [ ] No horizontal scrolling on any viewport
- [ ] Blog post TOC: sidebar on desktop, collapsible on mobile

### 7.3 Animations & Transitions
- [ ] Page transition animations (route changes)
- [ ] Scroll-triggered animations:
  - [ ] Sections fade/slide in as they enter viewport
  - [ ] Project cards stagger in
  - [ ] Skill badges animate in
- [ ] Hover effects:
  - [ ] Project cards (scale, shadow)
  - [ ] Blog cards (subtle lift)
  - [ ] Navigation links (underline slide)
  - [ ] Buttons (background transition)
- [ ] Smooth scroll for anchor links (TOC)
- [ ] Loading states:
  - [ ] Skeleton screens or subtle spinners
  - [ ] Contact form submit button loading
- [ ] `prefers-reduced-motion` respect:
  - [ ] Disable animations for users who prefer reduced motion

### 7.4 Accessibility
- [ ] Semantic HTML:
  - [ ] `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>`
  - [ ] Proper heading hierarchy (h1→h2→h3)
- [ ] ARIA attributes where needed
- [ ] Keyboard navigation:
  - [ ] Tab order makes sense
  - [ ] Focus visible indicators
  - [ ] Skip to main content link
  - [ ] Mobile menu keyboard accessible
- [ ] Alt text on all images
- [ ] Color contrast (WCAG AA minimum):
  - [ ] Text on background: 4.5:1
  - [ ] Large text: 3:1
- [ ] Screen reader testing (optional)

### 7.5 404 Page
- [x] Create not-found page component
  - [x] Friendly message
  - [x] Link back to home
  - [x] Consistent with site design

---

## Phase 8: Deployment

### 8.1 Server Configuration
- [ ] Provision server (VPS/VM) with Ubuntu/Debian
- [ ] Install runtime stack:
  - [ ] Docker Engine + Docker Compose plugin
  - [ ] Caddy (containerized reverse proxy)
- [x] Create deployment files:
  - [x] `api/Dockerfile` (build + run NestJS in production mode)
  - [x] `frontend/Dockerfile` (build + run Angular SSR server)
  - [x] `deploy/docker-compose.yml` (caddy + frontend + api services)
  - [x] `deploy/caddy/Caddyfile`
  - [ ] `deploy/.env.production` (server env variables)
- [ ] Configure environment variables on server:
  - [ ] `RESEND_API_KEY`
  - [ ] `CONTACT_EMAIL`
  - [ ] `SITE_URL`
  - [ ] `ADMIN_PASSWORD_HASH` (bcrypt hash)
  - [ ] `ADMIN_JWT_SECRET` (random string)
  - [ ] `ADMIN_SESSION_HOURS` (default: 24)
  - [ ] `GITHUB_TOKEN` (optional, admin git integration)
  - [ ] `GITHUB_REPO` (optional)
  - [ ] `GITHUB_BRANCH` (optional)
- [x] Test build locally: `npm run build`
  - [x] Content pipeline runs
  - [x] API bundles correctly
  - [x] Angular builds with SSR
- [ ] Run first deployment:
  - [ ] `docker compose -f deploy/docker-compose.yml up -d --build`
  - [ ] Verify containers are healthy (`docker compose ps`, `docker logs`)
- [x] Configure Caddy reverse proxy routes:
  - [x] `/` → frontend SSR container
  - [x] `/api/*` → api container
- [ ] Verify automatic HTTPS certificate issuance in Caddy
- [ ] Verify all pages render correctly
- [ ] Verify API endpoints work
- [ ] Test contact form submission on production

### 8.2 Custom Domain
- [ ] Purchase domain (if needed)
- [ ] Configure DNS for your server:
  - [ ] Point `@` and/or `www` to server IP (A/AAAA records)
  - [ ] Point `api` subdomain to same server or dedicated API server
  - [ ] Verify DNS is ready for Caddy automatic HTTPS
- [ ] Update `SITE_URL` environment variable
- [ ] Update canonical URLs
- [ ] Verify HTTPS works

### 8.3 GitHub Integration (for Admin)
- [ ] Generate GitHub Personal Access Token:
  - [ ] Go to GitHub Settings → Developer settings → Personal access tokens
  - [ ] Create token with `repo` scope (read/write access)
  - [ ] Copy token value
- [ ] Add GitHub token to environment variables:
  - [ ] `GITHUB_TOKEN` - Personal access token
  - [ ] `GITHUB_REPO` - Repository name (e.g., "username/portfolio")
  - [ ] `GITHUB_BRANCH` - Branch to commit to (e.g., "main")
- [ ] Create `api/src/services/github.service.ts`:
  - [ ] Function to commit new directory with multiple files
  - [ ] Function to update files in existing directory
  - [ ] Function to delete entire directory
  - [ ] Function to upload binary images to directory
  - [ ] Handle GitHub API responses and tree creation
- [ ] Update admin service to use GitHub integration
- [ ] Test committing posts via admin dashboard:
  - [ ] Create test post in admin
  - [ ] Verify commit appears in GitHub
  - [ ] Verify CI/CD deploy or server webhook runs
  - [ ] Verify new post appears on site

### 8.4 Analytics & Monitoring
- [ ] Configure basic uptime monitoring (UptimeRobot/Better Stack)
- [ ] Configure server logs:
  - [ ] Caddy access + error logs
  - [ ] Container logs (`docker compose logs api frontend`)
- [ ] Configure backup & recovery:
  - [ ] Backup `deploy/.env.production` securely
  - [ ] Backup TLS certificates or document re-issuance steps
  - [ ] Document rollback command (`docker compose ... up -d --build` on previous commit)
- [ ] Set up Google Search Console:
  - [ ] Verify domain ownership
  - [ ] Submit sitemap.xml
- [ ] Set up Google Analytics 4 (optional):
  - [ ] Create GA4 property
  - [ ] Add tracking code
  - [ ] Configure privacy-respecting settings

### 8.5 Final Testing
- [ ] Test all pages on production URL
- [ ] Test contact form end-to-end
- [ ] Test dark theme
- [ ] Test on mobile devices (real devices if possible)
- [ ] Run Lighthouse on production:
  - [ ] Performance: 95+
  - [ ] Accessibility: 100
  - [ ] Best Practices: 100
  - [ ] SEO: 100
- [ ] Test Open Graph tags (use Facebook Sharing Debugger)
- [ ] Test Twitter Card (use Twitter Card Validator)
- [ ] Verify sitemap.xml accessible
- [ ] Verify robots.txt accessible
- [ ] Check all links work (no broken links)

---

## Phase 9: Content & Launch

### 9.1 Content Creation
- [x] Write "About Me" content (`content/about.md`)
  - [ ] Professional bio
  - [ ] Background/journey
  - [ ] Current focus
  - [ ] Personal interests
- [x] Add all projects to `content/projects.json`
  - [ ] Study Focus Tracker (featured)
  - [ ] This portfolio site (featured)
  - [ ] Add 1-3 more projects
  - [ ] Screenshots/images for each
- [ ] Update `content/skills.json` with your actual skills
- [ ] Write first blog post(s) (via admin panel or manually):
  - [ ] "Building a Microservices Platform with Node.js & NestJS" (about Study Tracker)
  - [ ] "How I Built This Portfolio" (about this project)
- [x] Prepare resume PDF (`assets/resume.pdf`)
- [ ] Create/update OG image
- [~] Add profile photo (optimized WebP)

### 9.2 Admin Testing
- [ ] Test admin authentication:
  - [ ] Login with correct password succeeds
  - [ ] Login with wrong password fails
  - [ ] Rate limiting works after 5 failed attempts
  - [ ] Session expires correctly
  - [ ] Logout clears session
- [ ] Test admin dashboard:
  - [ ] All posts load correctly
  - [ ] Draft and published status displayed
  - [ ] Delete confirmation works
  - [ ] Edit links route correctly
- [ ] Test post creation:
  - [ ] New post form validation works
  - [ ] Slug auto-generation from title
  - [ ] Save draft creates unpublished post
  - [ ] Publish creates live post
  - [ ] Markdown renders correctly
- [ ] Test post editing:
  - [ ] Existing post loads into form
  - [ ] Changes save correctly
  - [ ] Slug changes rename file properly
- [ ] Test GitHub integration:
  - [ ] New post commits to repo
  - [ ] Edited post updates file
  - [ ] Deleted post removes file
  - [ ] Deploy pipeline updates production on commit

### 9.3 Final Polish
- [ ] Proofread all content
- [ ] Check all external links
- [ ] Verify email notifications arrive correctly
- [ ] Cross-browser testing:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Final Lighthouse audit
- [ ] Share with a friend for feedback

### 9.4 Launch
- [ ] Push final changes to GitHub
- [ ] Verify deploy pipeline or manual deploy script works
- [ ] Test production site one final time
- [ ] Update LinkedIn with portfolio URL
- [ ] Update GitHub profile README with portfolio link
- [ ] Share on social media (optional)

---

## Progress Summary

### Phase Status
- [x] Phase 1: Project Setup & Foundation 4/4 sections ✓
- [x] Phase 2: Layout & Core Infrastructure 4/4 sections ✓
- [x] Phase 3: Home Page 6/6 sections ✓
- [~] Phase 4: Content Pages 7/7 sections (feature-complete, polish pending)
- [~] Phase 5: API Development 5/5 sections (core complete, e2e/test gaps pending)
- [~] Phase 6: SEO & Performance 2/3 sections in progress
- [~] Phase 7: Polish & UX 2/5 sections in progress
- [~] Phase 8: Deployment 1/5 sections in progress
- [~] Phase 9: Content & Launch 1/3 sections in progress

### Overall Progress
**Total Tasks: ~200**
**Completed: 3/9 phases fully complete (Phases 1, 2, and 3 complete), 6 phases in progress**
**Percentage: ~60%**

**Estimated Timeline:**
- Week 1: Setup + Layout + Home page
- Week 2: Content pages (Projects, Blog, About, Contact)
- Week 3: API + SEO + Polish + Deploy + Launch

---

## Notes & Issues

### Blocked Tasks
- None currently

### Known Issues
- None currently

### Completed
- Phase 1.1: Repository & Workspace Setup ✓
- Phase 1.2: NestJS API Setup ✓
- Phase 1.3: Angular Frontend Setup ✓
- Phase 1.4: Content Pipeline Setup ✓
- Phase 2.1: Angular App Configuration ✓
- Phase 2.2: Core Services ✓
- Phase 2.3: Layout Components ✓
- Phase 2.4: Shared Components ✓
- Phase 3.1: Home Page Component ✓
- Phase 3.2: Hero Section ✓
- Phase 3.3: Featured Projects Section ✓
- Phase 3.4: Skills Overview Section ✓
- Phase 3.5: Latest Blog Posts Section ✓
- Phase 3.6: CTA Section ✓

### Design Inspiration
- (Add portfolio sites you like for reference)

### Learning Resources
- NestJS docs: https://docs.nestjs.com
- Node.js docs: https://nodejs.org/docs
- Angular SSR: https://angular.dev/guide/ssr
- Tailwind CSS: https://tailwindcss.com
- Resend: https://resend.com/docs
- Shiki: https://shiki.matsu.io
- Docker Compose: https://docs.docker.com/compose/

---

**Last Updated:** ___
**Next Milestone:** ___
