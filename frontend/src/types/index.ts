export type ContentCollection = 'projects' | 'posts' | 'pages';
export type PublicationStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type SynchronizationStatus =
  | 'clean'
  | 'local-draft'
  | 'modified'
  | 'syncing'
  | 'synced'
  | 'commit-required'
  | 'committed'
  | 'push-required'
  | 'pushed'
  | 'conflict'
  | 'error';
export type GitFileStatus = 'modified' | 'added' | 'deleted' | 'untracked';

export interface BaseFrontmatter {
  title: string;
  slug: string;
  description: string;
  status: PublicationStatus;
  updatedAt: string;
  [key: string]: unknown;
}

export interface ProjectFrontmatter extends BaseFrontmatter {
  projectType: string;
  role: string;
  duration: string;
  technologies: string[];
  featured: boolean;
  repositoryUrl?: string;
  liveUrl?: string;
  coverImage?: string;
  publishedAt?: string;
  displayOrder?: number;
}

export interface BlogPostFrontmatter extends BaseFrontmatter {
  category: string;
  tags: string[];
  featured: boolean;
  coverImage?: string;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PageFrontmatter extends BaseFrontmatter {
  title: string;
}

export type ParsedFrontmatter = ProjectFrontmatter | BlogPostFrontmatter | PageFrontmatter;

export interface MarkdownDocument<TFrontmatter extends ParsedFrontmatter = ParsedFrontmatter> {
  path: string;
  filename: string;
  collection: ContentCollection;
  frontmatter: TFrontmatter;
  body: string;
  raw: string;
  version: number;
  size: number;
  createdAt: string;
  updatedAt: string;
  synchronizationStatus: SynchronizationStatus;
}

export interface ContentFileSummary {
  path: string;
  filename: string;
  collection: ContentCollection;
  title: string;
  slug: string;
  status: PublicationStatus;
  featured?: boolean;
  category?: string;
  technologies?: string[];
  updatedAt: string;
  size: number;
  synchronizationStatus: SynchronizationStatus;
  gitStatus?: GitFileStatus;
}

export interface ContentQuery {
  collection?: ContentCollection;
  search?: string;
  status?: PublicationStatus | 'all';
  featured?: boolean | 'all';
}

export interface CreateContentFileInput {
  collection: ContentCollection;
  filename: string;
  raw: string;
}

export interface UpdateContentFileInput {
  raw: string;
}

export interface ImportMarkdownFileInput extends CreateContentFileInput {
  overwrite?: boolean;
}

export interface GitStatus {
  branch: string;
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
  ahead: number;
  behind: number;
  lastSyncAt: string;
  conflict: boolean;
}

export interface GitCommit {
  id: string;
  message: string;
  author: string;
  createdAt: string;
  files: string[];
}

export interface CreateCommitInput {
  message: string;
  files: string[];
}

export interface GitPushResult {
  success: boolean;
  pushedCommits: number;
  message: string;
}

export interface GitPullResult {
  success: boolean;
  updatedFiles: string[];
  message: string;
  conflict?: ConflictData;
}

export interface ConflictData {
  path: string;
  localRaw: string;
  remoteRaw: string;
  baseRaw: string;
}

export interface UserSession {
  email: string;
  name: string;
  remember: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface SiteSettings {
  name: string;
  role: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  availability: boolean;
}
