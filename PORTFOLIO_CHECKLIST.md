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
- [x] Create `.gitignore` (node_modules, dist, .env, generated/, .vercel/)
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
- [ ] Create `scripts/build-content.ts`
- [ ] Install content processing dependencies (in root or scripts):
  - [ ] `gray-matter` (frontmatter parsing)
  - [ ] `marked` (Markdown → HTML)
  - [ ] `shiki` (syntax highlighting)
  - [ ] `reading-time` (calculate read time)
- [ ] Create sample blog post: `content/blog/hello-world/`
  - [ ] Create directory: `content/blog/hello-world/`
  - [ ] Add `index.md` with frontmatter (title, slug, date, tags, excerpt, published)
  - [ ] Add sample content with code blocks
  - [ ] Add sample images to demonstrate directory structure
- [ ] Create `content/projects.json` with 1-2 sample projects
- [ ] Create `content/skills.json` with skill categories
- [ ] Implement build script:
  - [ ] Scan `content/blog/` for directories (each directory = one post)
  - [ ] Read `index.md` from each post directory
  - [ ] Parse frontmatter with `gray-matter`
  - [ ] Resolve relative image paths (e.g., `./cover.webp` → full path)
  - [ ] Copy post images to `generated/blog/{slug}/` directory
  - [ ] Convert markdown to HTML with `marked`
  - [ ] Apply syntax highlighting with `shiki`
  - [ ] Calculate reading time
  - [ ] Extract table of contents from headings
  - [ ] Generate `generated/blog-index.json` (metadata only)
  - [ ] Generate `generated/blog/{slug}/index.json` (full content + metadata)
  - [ ] Copy `projects.json` and `skills.json` to `generated/`
- [ ] Test: `npm run build:content` produces correct output
- [ ] Add `generated/` to `.gitignore`

---

## Phase 2: Layout & Core Infrastructure

### 2.1 Angular App Configuration
- [ ] Create `app.config.ts` (standalone config):
  - [ ] Configure HttpClient with `provideHttpClient(withFetch())`
  - [ ] Configure Router with `provideRouter(routes)`
  - [ ] Configure Angular animations
  - [ ] Configure SSR transfer state
- [ ] Create `app.routes.ts`:
  - [ ] `/` → Home (eager)
  - [ ] `/projects` → Projects list (lazy)
  - [ ] `/projects/:id` → Project detail (lazy)
  - [ ] `/blog` → Blog list (lazy)
  - [ ] `/blog/:slug` → Blog post (lazy)
  - [ ] `/about` → About (lazy)
  - [ ] `/contact` → Contact (lazy)
  - [ ] `/admin` → Admin Dashboard (lazy, guarded)
  - [ ] `/admin/login` → Admin Login (lazy)
  - [ ] `/admin/new` → New Post Editor (lazy, guarded)
  - [ ] `/admin/edit/:slug` → Edit Post (lazy, guarded)
  - [ ] `**` → 404 redirect to home

### 2.2 Core Services
- [ ] Create `core/services/api.service.ts`
  - [ ] Inject `HttpClient`
  - [ ] Base URL configuration (environment-based)
  - [ ] GET method with generic typing
  - [ ] POST method with generic typing
  - [ ] Error handling (catchError, retry)
- [ ] Create `core/services/seo.service.ts`
  - [ ] Inject `Title`, `Meta` services
  - [ ] `updateTitle(title: string)` method
  - [ ] `updateMetaTags(config)` method
  - [ ] `setOpenGraph(config)` method
  - [ ] `setTwitterCard(config)` method
  - [ ] `setJsonLd(data)` method (structured data)
- [ ] Create `core/services/theme.service.ts`
  - [ ] Check `localStorage` for saved preference
  - [ ] Check `prefers-color-scheme` media query
  - [ ] Toggle dark/light mode
  - [ ] Apply `dark` class to `<html>`
  - [ ] Persist preference to `localStorage`
  - [ ] Expose `isDark$` observable (BehaviorSubject)
- [ ] Create `core/interceptors/error.interceptor.ts`
  - [ ] Log errors
  - [ ] Handle common HTTP errors

### 2.3 Layout Components
- [ ] Create `layout/layout.component.ts`
  - [ ] Shell component with header + main + footer
  - [ ] Router outlet in main area
- [ ] Create `layout/header/header.component.ts`
  - [ ] Logo/name (links to home)
  - [ ] Navigation links: Home, Projects, Blog, About, Contact
  - [ ] Theme toggle button (sun/moon icon)
  - [ ] Resume download link
  - [ ] Mobile hamburger menu
  - [ ] Mobile slide-out navigation
  - [ ] Sticky header with backdrop blur on scroll
  - [ ] Active route highlighting
- [ ] Create `layout/footer/footer.component.ts`
  - [ ] Copyright notice
  - [ ] Social links (GitHub, LinkedIn, Twitter/X, Email)
  - [ ] "Built with" tech credits
  - [ ] Quick navigation links

### 2.4 Shared Components
- [ ] Create `shared/components/project-card.component.ts`
  - [ ] Project image/thumbnail
  - [ ] Title and short description
  - [ ] Technology tags
  - [ ] Links (live, GitHub)
  - [ ] Hover effect / animation
- [ ] Create `shared/components/blog-card.component.ts`
  - [ ] Cover image (optional)
  - [ ] Title
  - [ ] Date + reading time
  - [ ] Excerpt
  - [ ] Tags
  - [ ] Hover effect
- [ ] Create `shared/components/skill-badge.component.ts`
  - [ ] Icon + name
  - [ ] Optional proficiency indicator
  - [ ] Tooltip with details
- [ ] Create `shared/components/tag-filter.component.ts`
  - [ ] List of tag buttons
  - [ ] Active state styling
  - [ ] Emit selected tag
  - [ ] "All" option
- [ ] Create `shared/components/back-to-top.component.ts`
  - [ ] Show after scrolling 300px
  - [ ] Smooth scroll to top
  - [ ] Fade in/out animation
- [ ] Create `shared/components/section-heading.component.ts`
  - [ ] Consistent heading style across pages
  - [ ] Optional subtitle
- [ ] Create `shared/components/markdown-editor.component.ts` (for admin)
  - [ ] Textarea for markdown input
  - [ ] Toolbar with common markdown shortcuts (bold, italic, code, link)
  - [ ] Word count display
  - [ ] Auto-resize or fixed height options
  - [ ] Tab key support for indentation
- [ ] Create `shared/components/markdown-preview.component.ts` (for admin)
  - [ ] Render markdown to HTML preview
  - [ ] Syntax highlighting in preview
  - [ ] Sync scroll with editor (optional)

---

## Phase 3: Home Page

### 3.1 Home Page Component
- [ ] Create `pages/home/home.component.ts`
  - [ ] Compose sections
  - [ ] Set SEO meta tags (title, description, og tags)
  - [ ] Load featured projects and latest posts data

### 3.2 Hero Section
- [ ] Create `pages/home/sections/hero.component.ts`
  - [ ] Greeting text with your name
  - [ ] Title/role ("Full-Stack Developer")
  - [ ] Short tagline (1-2 sentences about what you do)
  - [ ] CTA buttons: "View Projects" + "Read Blog"
  - [ ] Social media links (GitHub, LinkedIn, Twitter/X)
  - [ ] Subtle entrance animation (fade in + slide up)
  - [ ] Optional: animated typing effect for tagline
  - [ ] Optional: gradient text or accent color highlights
  - [ ] Responsive: stack vertically on mobile

### 3.3 Featured Projects Section
- [ ] Create `pages/home/sections/featured-projects.component.ts`
  - [ ] Section heading: "Featured Projects"
  - [ ] Display 3 featured projects (from projects.json where `featured: true`)
  - [ ] Use `project-card` shared component
  - [ ] Grid layout: 3 columns desktop, 2 tablet, 1 mobile
  - [ ] Staggered fade-in animation on scroll
  - [ ] "View All Projects →" link at bottom

### 3.4 Skills Overview Section
- [ ] Create `pages/home/sections/skills-overview.component.ts`
  - [ ] Section heading: "Tech Stack"
  - [ ] Load skills from `skills.json`
  - [ ] Display by category (Languages, Frontend, Backend, DevOps)
  - [ ] Use `skill-badge` components
  - [ ] Grid or flex layout
  - [ ] Fade-in animation on scroll

### 3.5 Latest Blog Posts Section
- [ ] Create `pages/home/sections/latest-posts.component.ts`
  - [ ] Section heading: "Latest Posts"
  - [ ] Display 3 most recent blog posts
  - [ ] Use `blog-card` shared component
  - [ ] "Read All Posts →" link at bottom
  - [ ] Staggered animation

### 3.6 CTA Section
- [ ] Create `pages/home/sections/cta.component.ts`
  - [ ] Call-to-action text: "Let's work together" or "Interested in collaborating?"
  - [ ] Buttons: "Get in Touch" + "Download Resume"
  - [ ] Background accent color or subtle gradient
  - [ ] Clean, centered layout

---

## Phase 4: Content Pages

### 4.1 Projects Page
- [ ] Create `pages/projects/projects-list.component.ts`
  - [ ] Page title: "Projects"
  - [ ] Set SEO meta tags
  - [ ] Load projects from API or generated JSON
  - [ ] Tag filter component (filter by technology)
  - [ ] Grid of project cards
  - [ ] Filter animation (fade out/in filtered items)
  - [ ] Categories: "All", "Frontend", "Backend", "Full-Stack", etc.
  - [ ] Responsive grid: 3→2→1 columns

### 4.2 Project Detail Page
- [ ] Create `pages/projects/project-detail.component.ts`
  - [ ] Route: `/projects/:id`
  - [ ] Set SEO meta tags per project
  - [ ] Large project image/screenshot
  - [ ] Title + description
  - [ ] Technology tags
  - [ ] Highlights list (bullet points of key features)
  - [ ] Links: Live Demo, GitHub Repo
  - [ ] "← Back to Projects" link
  - [ ] Related projects section (same tags)

### 4.3 Blog List Page
- [ ] Create `pages/blog/blog-list.component.ts`
  - [ ] Page title: "Blog"
  - [ ] Subtitle: "Thoughts on code, projects, and learning"
  - [ ] Set SEO meta tags
  - [ ] Load blog index from generated JSON
  - [ ] Tag filter component (filter by tag)
  - [ ] Client-side search (filter by title/excerpt)
  - [ ] List of blog cards
  - [ ] Sort by date (newest first)
  - [ ] Responsive layout

### 4.4 Blog Post Page
- [ ] Create `pages/blog/blog-post.component.ts`
  - [ ] Route: `/blog/:slug`
  - [ ] Set SEO meta tags per post (title, description, og:image)
  - [ ] Set JSON-LD structured data (BlogPosting schema)
  - [ ] "← Back to Blog" link
  - [ ] Post title + date + reading time
  - [ ] Tags
  - [ ] Cover image (optional)
  - [ ] Table of contents (from generated TOC data)
    - [ ] Sticky sidebar on desktop
    - [ ] Collapsible on mobile
    - [ ] Active section highlighting on scroll
  - [ ] Article content (rendered HTML from generated JSON)
  - [ ] Code blocks with syntax highlighting (pre-generated by Shiki)
  - [ ] Copy code button on code blocks
  - [ ] Typography/prose styling for article content
  - [ ] Share buttons: Twitter, LinkedIn, Copy Link
  - [ ] Previous/Next post navigation
  - [ ] Scroll progress indicator (optional)

### 4.5 About Page
- [ ] Create `pages/about/about.component.ts`
  - [ ] Set SEO meta tags
  - [ ] Personal photo/avatar
  - [ ] Bio text (from `content/about.md` processed to HTML)
  - [ ] "What I do" section
  - [ ] Timeline or journey section (optional)
  - [ ] Current focus / what I'm learning
  - [ ] Fun facts or personal interests
  - [ ] CTA: "Get in touch" + social links
  - [ ] Resume download button

### 4.6 Contact Page
- [ ] Create `pages/contact/contact.component.ts`
  - [ ] Set SEO meta tags
  - [ ] Page title: "Get in Touch"
  - [ ] Contact form:
    - [ ] Name field (required, min 2 chars)
    - [ ] Email field (required, valid email)
    - [ ] Subject field (required, min 5 chars)
    - [ ] Message textarea (required, min 20 chars)
    - [ ] Honeypot field (hidden, for spam prevention)
    - [ ] Submit button with loading state
  - [ ] Form validation with error messages
  - [ ] Success message after submission
  - [ ] Error message on failure
  - [ ] Rate limiting feedback (prevent spam clicking)
  - [ ] Alternative contact methods:
    - [ ] Email address
    - [ ] Social media links
    - [ ] LinkedIn profile

### 4.7 Admin Pages
- [ ] Create admin route guard `pages/admin/admin.guard.ts`
  - [ ] Check authentication status on route activation
  - [ ] Redirect to login if not authenticated
  - [ ] Verify token validity via API
- [ ] Create admin auth service `core/services/admin-auth.service.ts`
  - [ ] Login method (POST to /api/admin/login)
  - [ ] Logout method (POST to /api/admin/logout)
  - [ ] Verify auth status (GET /api/admin/verify)
  - [ ] Store auth state (BehaviorSubject)
  - [ ] Handle HTTP-only cookie automatically
- [ ] Create `pages/admin/admin-login.component.ts`
  - [ ] Route: `/admin/login`
  - [ ] Password input field
  - [ ] Login button with loading state
  - [ ] Error message for invalid credentials
  - [ ] Redirect to dashboard on success
- [ ] Create `pages/admin/admin-dashboard.component.ts`
  - [ ] Route: `/admin`
  - [ ] Protected by admin guard
  - [ ] Display all blog posts (drafts + published)
  - [ ] Post status indicators (draft/published)
  - [ ] "New Post" button
  - [ ] Edit/Delete buttons for each post
  - [ ] Confirmation dialog for delete
  - [ ] Empty state when no posts exist
- [ ] Create `pages/admin/admin-editor.component.ts`
  - [ ] Route: `/admin/edit/:slug` (edit) and `/admin/new` (create)
  - [ ] Protected by admin guard
  - [ ] Form fields:
    - [ ] Title input
    - [ ] Slug input (auto-generate from title)
    - [ ] Date picker (default to today)
    - [ ] Tags input (comma-separated)
    - [ ] Excerpt textarea
    - [ ] Cover image URL input
    - [ ] Published checkbox
    - [ ] Markdown content textarea (full height)
  - [ ] Live preview toggle (rendered markdown)
  - [ ] Save Draft button
  - [ ] Publish button
  - [ ] Auto-save indicator (optional)
  - [ ] Form validation
  - [ ] Success/error feedback
  - [ ] Discard changes confirmation
- [ ] Update `app.routes.ts` with admin routes:
  - [ ] `/admin` → Admin Dashboard (guarded)
  - [ ] `/admin/login` → Admin Login
  - [ ] `/admin/new` → New Post Editor (guarded)
  - [ ] `/admin/edit/:slug` → Edit Post (guarded)
- [ ] Add link to admin in footer (subtle)

---

## Phase 5: API Development

### 5.1 Contact Endpoint
- [ ] Create `api/src/contact/contact.controller.ts`
  - [ ] `POST /api/contact` endpoint
  - [ ] class-validator DTO:
    - [ ] name: string (min 2, max 100)
    - [ ] email: string (email format)
    - [ ] subject: string (min 5, max 200)
    - [ ] message: string (min 20, max 5000)
    - [ ] honeypot: string (must be empty)
  - [ ] Reject if honeypot field is filled (spam bot)
  - [ ] Rate limiting with @nestjs/throttler (max 3 submissions per hour per IP)
- [ ] Create `api/src/services/email.service.ts`
  - [ ] Configure Resend client
  - [ ] Create email sending function
  - [ ] HTML email template for contact submissions
  - [ ] Send to your configured `CONTACT_EMAIL`
  - [ ] Auto-reply to sender (optional)
- [ ] Test contact endpoint with valid data
- [ ] Test validation rejection
- [ ] Test honeypot spam prevention
- [ ] Test email delivery

### 5.2 Blog API Endpoints
- [ ] Create `api/src/blog/blog.controller.ts`
  - [ ] `GET /api/blog` - Return blog index (all post metadata)
    - [ ] Read from `generated/blog-index.json`
    - [ ] Optional: filter by tag query param
    - [ ] Optional: pagination (limit/offset)
  - [ ] `GET /api/blog/:slug` - Return full blog post
    - [ ] Read from `generated/blog/{slug}.json`
    - [ ] Return 404 if not found
  - [ ] `GET /api/blog/tags` - Return all unique tags
    - [ ] Aggregate from blog index
- [ ] Create `api/src/blog/blog.service.ts` for business logic
- [ ] Test blog endpoints return correct data

### 5.3 Projects API Endpoints
- [ ] Create `api/src/projects/projects.controller.ts`
  - [ ] `GET /api/projects` - Return all projects
    - [ ] Read from `generated/projects.json`
    - [ ] Optional: filter by category
  - [ ] `GET /api/projects/:id` - Return single project
    - [ ] Return 404 if not found
- [ ] Create `api/src/projects/projects.service.ts` for business logic
- [ ] Test project endpoints

### 5.4 Admin API Endpoints
- [ ] Create `api/src/admin/admin.controller.ts`
  - [ ] `POST /api/admin/login` - Authenticate admin
    - [ ] Validate password against hash
    - [ ] Generate JWT token
    - [ ] Set HTTP-only cookie
    - [ ] Rate limit: 5 attempts per minute per IP
  - [ ] `POST /api/admin/logout` - Clear auth cookie
  - [ ] `GET /api/admin/verify` - Check authentication status
  - [ ] `GET /api/admin/posts` - List all posts (including drafts)
  - [ ] `POST /api/admin/posts` - Create new blog post
    - [ ] Validate form data with class-validator DTOs
    - [ ] Generate markdown file with frontmatter
    - [ ] Save to `content/blog/{slug}/index.md`
    - [ ] Return success/error response
  - [ ] `PUT /api/admin/posts/:slug` - Update existing post
    - [ ] Read existing file
    - [ ] Update content and frontmatter
    - [ ] Handle slug changes (rename file)
  - [ ] `DELETE /api/admin/posts/:slug` - Delete post
    - [ ] Remove entire post directory
    - [ ] Return confirmation
  - [ ] `POST /api/admin/posts/:slug/images` - Upload image
    - [ ] Validate file type (jpg, png, webp, svg, gif)
    - [ ] Validate file size (max 5MB)
    - [ ] Save to post directory
    - [ ] Return relative path for markdown
- [ ] Create `api/src/admin/admin.service.ts`
  - [ ] Password verification function
  - [ ] JWT token generation/verification
  - [ ] File I/O operations for markdown
  - [ ] Frontmatter serialization
  - [ ] Directory creation for new posts
  - [ ] Image upload handling to post directory
  - [ ] Handle relative image path resolution
- [ ] Create `api/src/auth/auth.guard.ts`
  - [ ] Verify JWT from cookie using @nestjs/passport
  - [ ] Attach admin status to request
  - [ ] Return 401 for unauthenticated requests
- [ ] Create `api/src/auth/auth.module.ts`
  - [ ] Configure JWT strategy
  - [ ] Configure Passport
- [ ] Add environment variables:
  - [ ] `ADMIN_PASSWORD_HASH` - Bcrypt hash
  - [ ] `ADMIN_JWT_SECRET` - JWT signing key
  - [ ] `ADMIN_SESSION_HOURS` - Token expiry

### 5.5 API Integration
- [ ] Register all modules in `api/src/app.module.ts`
  - [ ] ContactModule
  - [ ] BlogModule
  - [ ] ProjectsModule
  - [ ] AdminModule
  - [ ] AuthModule
- [ ] Configure CORS (allow frontend origin)
- [ ] Add request logging with @nestjs/common Logger
- [ ] Configure global validation pipe
- [ ] Test all endpoints end-to-end
- [ ] Configure for Vercel serverless deployment

---

## Phase 6: SEO & Performance

### 6.1 SEO Implementation
- [ ] Implement SEO service calls on every page:
  - [ ] Home: title, description, og tags
  - [ ] Projects list: title, description
  - [ ] Project detail: per-project title, description, image
  - [ ] Blog list: title, description
  - [ ] Blog post: per-post title, description, og:image, JSON-LD
  - [ ] About: title, description
  - [ ] Contact: title, description
- [ ] Add JSON-LD structured data:
  - [ ] Person (on home/about)
  - [ ] WebSite (on home)
  - [ ] BlogPosting (on each blog post)
  - [ ] BreadcrumbList (on inner pages)
- [ ] Create `sitemap.xml` generation script
  - [ ] Include all static routes
  - [ ] Include all blog post routes
  - [ ] Set lastmod dates
- [ ] Create `robots.txt`
  - [ ] Allow all crawlers
  - [ ] Point to sitemap.xml
- [ ] Add canonical URLs to all pages
- [ ] Configure Open Graph image (`og-image.png`)
  - [ ] Create default OG image (1200x630)
  - [ ] Per-post OG images (optional)

### 6.2 Angular SSR & Prerendering
- [ ] Configure `@angular/ssr`:
  - [ ] Server entry point
  - [ ] TransferState for API calls
- [ ] Configure prerendering in `angular.json`:
  - [ ] Static routes: `/`, `/projects`, `/blog`, `/about`, `/contact`
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

### 7.1 Dark Mode
- [ ] Implement theme toggle in header
  - [ ] Sun/moon icon with smooth transition
  - [ ] Swap CSS class on `<html>`
- [ ] Theme persistence (localStorage)
- [ ] System preference detection (`prefers-color-scheme`)
- [ ] Test all pages in both themes
- [ ] Code block theme adapts to dark/light
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
- [ ] Create not-found page component
  - [ ] Friendly message
  - [ ] Link back to home
  - [ ] Consistent with site design

---

## Phase 8: Deployment

### 8.1 Vercel Configuration
- [ ] Create `vercel.json`:
  - [ ] Build command: `npm run build`
  - [ ] Output directory configuration
  - [ ] API function routing (`/api/*`)
  - [ ] SPA fallback rewrites
- [ ] Configure Vercel project:
  - [ ] Connect GitHub repository
  - [ ] Set framework preset (or custom)
  - [ ] Configure environment variables:
    - [ ] `RESEND_API_KEY`
    - [ ] `CONTACT_EMAIL`
    - [ ] `SITE_URL`
    - [ ] `ADMIN_PASSWORD_HASH` (bcrypt hash)
    - [ ] `ADMIN_JWT_SECRET` (random string)
    - [ ] `ADMIN_SESSION_HOURS` (default: 24)
- [ ] Test build locally: `npm run build`
  - [ ] Content pipeline runs
  - [ ] API bundles correctly
  - [ ] Angular builds with SSR
- [ ] Deploy to Vercel
- [ ] Verify all pages render correctly
- [ ] Verify API endpoints work
- [ ] Test contact form submission on production

### 8.2 Custom Domain
- [ ] Purchase domain (if needed)
- [ ] Configure DNS in Vercel:
  - [ ] Add custom domain
  - [ ] Configure DNS records (CNAME or A)
  - [ ] SSL certificate (automatic via Vercel)
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
  - [ ] Verify Vercel auto-deploys
  - [ ] Verify new post appears on site

### 8.4 Analytics & Monitoring
- [ ] Enable Vercel Analytics (free tier)
- [ ] Enable Vercel Speed Insights (optional)
- [ ] Set up Google Search Console:
  - [ ] Verify domain ownership
  - [ ] Submit sitemap.xml
- [ ] Set up Google Analytics 4 (optional):
  - [ ] Create GA4 property
  - [ ] Add tracking code
  - [ ] Configure privacy-respecting settings

### 8.4 Final Testing
- [ ] Test all pages on production URL
- [ ] Test contact form end-to-end
- [ ] Test dark/light mode
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
- [ ] Write "About Me" content (`content/about.md`)
  - [ ] Professional bio
  - [ ] Background/journey
  - [ ] Current focus
  - [ ] Personal interests
- [ ] Add all projects to `content/projects.json`
  - [ ] Study Focus Tracker (featured)
  - [ ] This portfolio site (featured)
  - [ ] Add 1-3 more projects
  - [ ] Screenshots/images for each
- [ ] Update `content/skills.json` with your actual skills
- [ ] Write first blog post(s) (via admin panel or manually):
  - [ ] "Building a Microservices Platform with Node.js & NestJS" (about Study Tracker)
  - [ ] "How I Built This Portfolio" (about this project)
- [ ] Prepare resume PDF (`assets/resume.pdf`)
- [ ] Create/update OG image
- [ ] Add profile photo (optimized WebP)

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
  - [ ] Vercel auto-deploys on commit

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
- [ ] Verify Vercel auto-deploys
- [ ] Test production site one final time
- [ ] Update LinkedIn with portfolio URL
- [ ] Update GitHub profile README with portfolio link
- [ ] Share on social media (optional)

---

## Progress Summary

### Phase Status
- [ ] Phase 1: Project Setup & Foundation ___/4 sections
- [ ] Phase 2: Layout & Core Infrastructure ___/6 sections
- [ ] Phase 3: Home Page ___/6 sections
- [ ] Phase 4: Content Pages ___/7 sections
- [ ] Phase 5: API Development ___/5 sections
- [ ] Phase 6: SEO & Performance ___/3 sections
- [ ] Phase 7: Polish & UX ___/5 sections
- [ ] Phase 8: Deployment ___/5 sections
- [ ] Phase 9: Content & Launch ___/3 sections

### Overall Progress
**Total Tasks: ~200**
**Completed: ___**
**Percentage: ___%**

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

### Design Inspiration
- (Add portfolio sites you like for reference)

### Learning Resources
- NestJS docs: https://docs.nestjs.com
- Node.js docs: https://nodejs.org/docs
- Angular SSR: https://angular.dev/guide/ssr
- Tailwind CSS: https://tailwindcss.com
- Resend: https://resend.com/docs
- Shiki: https://shiki.matsu.io
- Vercel Angular: https://vercel.com/docs/frameworks/angular

---

**Last Updated:** ___
**Next Milestone:** ___
