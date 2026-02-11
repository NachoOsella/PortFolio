#!/usr/bin/env node

/**
 * Content Build Script
 * 
 * Processes markdown blog posts and generates JSON files for the API.
 * Features:
 * - Parses YAML frontmatter with gray-matter
 * - Converts Markdown to HTML with marked
 * - Applies syntax highlighting with Shiki
 * - Calculates reading time
 * - Extracts table of contents from headings
 * - Copies static assets (images) to output directory
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';
import { codeToHtml } from 'shiki';
import readingTime from 'reading-time';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');
const GENERATED_DIR = path.join(__dirname, '..', 'generated');
const GENERATED_BLOG_DIR = path.join(GENERATED_DIR, 'blog');

// Types
interface BlogFrontmatter {
  title: string;
  slug: string;
  date: string;
  tags: string[];
  excerpt: string;
  published: boolean;
  featured?: boolean;
  coverImage?: string;
}

interface TableOfContentsItem {
  level: number;
  text: string;
  id: string;
}

interface BlogPost {
  meta: BlogFrontmatter & {
    readingTime: string;
    wordCount: number;
  };
  content: string;
  toc: TableOfContentsItem[];
}

interface BlogIndexItem {
  title: string;
  slug: string;
  date: string;
  tags: string[];
  excerpt: string;
  published: boolean;
  featured: boolean;
  coverImage?: string;
  readingTime: string;
  wordCount: number;
}

// Store code blocks for async highlighting
interface CodeBlock {
  id: string;
  code: string;
  lang?: string;
}

console.log('🔨 Building content...\n');

// Ensure directories exist
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(GENERATED_DIR);
ensureDir(GENERATED_BLOG_DIR);

// Generate unique ID for code blocks
let codeBlockId = 0;
const codeBlocks: CodeBlock[] = [];

// Custom renderer to capture code blocks
const renderer = new marked.Renderer();

renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  const id = `CODE_BLOCK_${codeBlockId++}`;
  codeBlocks.push({ id, code: text, lang });
  return `<!--${id}-->`;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
});

// Highlight all captured code blocks
async function highlightCodeBlocks(html: string): Promise<string> {
  for (const block of codeBlocks) {
    try {
      const highlighted = await codeToHtml(block.code, {
        lang: block.lang || 'text',
        theme: 'github-dark',
      });
      html = html.replace(`<!--${block.id}-->`, highlighted);
    } catch (error) {
      console.warn(`  ⚠️  Failed to highlight code block with language: ${block.lang}`);
      const fallback = `<pre><code>${block.code}</code></pre>`;
      html = html.replace(`<!--${block.id}-->`, fallback);
    }
  }
  return html;
}

// Extract table of contents from markdown
function extractTOC(markdown: string): TableOfContentsItem[] {
  const toc: TableOfContentsItem[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    toc.push({ level, text, id });
  }

  return toc;
}

// Process a single blog post
async function processBlogPost(postDir: string): Promise<BlogPost | null> {
  const indexPath = path.join(postDir, 'index.md');
  
  if (!fs.existsSync(indexPath)) {
    return null;
  }

  const slug = path.basename(postDir);
  console.log(`  📄 Processing: ${slug}`);

  try {
    // Read and parse the markdown file
    const fileContent = fs.readFileSync(indexPath, 'utf-8');
    const { data: frontmatter, content: markdown } = matter(fileContent);
    
    // Validate required frontmatter fields
    const requiredFields = ['title', 'slug', 'date', 'tags', 'excerpt', 'published'];
    for (const field of requiredFields) {
      if (!(field in frontmatter)) {
        console.warn(`    ⚠️  Missing required field: ${field}`);
      }
    }

    // Calculate reading time
    const readTime = readingTime(markdown);

    // Extract table of contents
    const toc = extractTOC(markdown);

    // Clear code blocks array for this post
    codeBlocks.length = 0;
    codeBlockId = 0;

    // Convert markdown to HTML (with placeholders for code blocks)
    const htmlWithPlaceholders = await marked.parse(markdown);

    // Apply syntax highlighting to code blocks
    const htmlContent = await highlightCodeBlocks(htmlWithPlaceholders);

    // Process cover image path
    let coverImage = frontmatter.coverImage;
    if (coverImage && coverImage.startsWith('./')) {
      coverImage = `/blog/${slug}/${coverImage.replace('./', '')}`;
    }

    // Copy post images to generated directory
    const postGeneratedDir = path.join(GENERATED_BLOG_DIR, slug);
    ensureDir(postGeneratedDir);

    const postFiles = fs.readdirSync(postDir);
    for (const file of postFiles) {
      if (file !== 'index.md') {
        const srcPath = path.join(postDir, file);
        const destPath = path.join(postGeneratedDir, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`    📎 Copied: ${file}`);
      }
    }

    const post: BlogPost = {
      meta: {
        ...frontmatter as BlogFrontmatter,
        readingTime: readTime.text,
        wordCount: readTime.words,
      },
      content: htmlContent,
      toc,
    };

    // Save full post JSON
    const postOutputPath = path.join(postGeneratedDir, 'index.json');
    fs.writeFileSync(postOutputPath, JSON.stringify(post, null, 2));
    console.log(`    ✅ Generated: ${path.relative(GENERATED_DIR, postOutputPath)}`);

    return post;
  } catch (error) {
    console.error(`    ❌ Error processing ${slug}:`, error);
    return null;
  }
}

// Main build function
async function buildContent(): Promise<void> {
  const startTime = Date.now();

  try {
    // Process blog posts
    console.log('📚 Processing blog posts...\n');
    
    if (!fs.existsSync(BLOG_DIR)) {
      console.log('  ℹ️  No blog directory found, skipping...');
    } else {
      const blogDirs = fs.readdirSync(BLOG_DIR)
        .filter(item => fs.statSync(path.join(BLOG_DIR, item)).isDirectory())
        .sort();

      console.log(`  Found ${blogDirs.length} blog post(s)\n`);

      const blogPosts: BlogPost[] = [];

      for (const dir of blogDirs) {
        const postDir = path.join(BLOG_DIR, dir);
        const post = await processBlogPost(postDir);
        if (post) {
          blogPosts.push(post);
        }
        console.log('');
      }

      // Generate blog index (metadata only)
      console.log('🗂️  Generating blog index...');
      const blogIndex: BlogIndexItem[] = blogPosts.map(post => ({
        title: post.meta.title,
        slug: post.meta.slug,
        date: post.meta.date,
        tags: post.meta.tags,
        excerpt: post.meta.excerpt,
        published: post.meta.published,
        featured: post.meta.featured || false,
        coverImage: post.meta.coverImage,
        readingTime: post.meta.readingTime,
        wordCount: post.meta.wordCount,
      }));

      // Sort by date (newest first)
      blogIndex.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const indexPath = path.join(GENERATED_DIR, 'blog-index.json');
      fs.writeFileSync(indexPath, JSON.stringify(blogIndex, null, 2));
      console.log(`  ✅ Generated: ${path.relative(GENERATED_DIR, indexPath)}`);
      console.log(`     ${blogIndex.length} post(s) indexed\n`);
    }

    // Copy projects.json
    console.log('📋 Copying static content files...');
    const projectsSrc = path.join(CONTENT_DIR, 'projects.json');
    const projectsDest = path.join(GENERATED_DIR, 'projects.json');
    
    if (fs.existsSync(projectsSrc)) {
      fs.copyFileSync(projectsSrc, projectsDest);
      const projects = JSON.parse(fs.readFileSync(projectsSrc, 'utf-8'));
      console.log(`  ✅ Copied projects.json (${projects.length} project(s))`);
    } else {
      console.log('  ℹ️  No projects.json found');
    }

    // Copy skills.json
    const skillsSrc = path.join(CONTENT_DIR, 'skills.json');
    const skillsDest = path.join(GENERATED_DIR, 'skills.json');
    
    if (fs.existsSync(skillsSrc)) {
      fs.copyFileSync(skillsSrc, skillsDest);
      const skills = JSON.parse(fs.readFileSync(skillsSrc, 'utf-8'));
      console.log(`  ✅ Copied skills.json (${skills.categories?.length || 0} categorie(s))`);
    } else {
      console.log('  ℹ️  No skills.json found');
    }

    const duration = Date.now() - startTime;
    console.log(`\n✨ Content build complete in ${duration}ms!`);
    console.log(`📁 Output: ${GENERATED_DIR}\n`);

  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
buildContent();