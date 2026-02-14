export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    tags: string[];
    excerpt: string;
    published: boolean;
    featured: boolean;
    coverImage?: string;
    readingTime?: string;
    content?: string;
    toc?: TocItem[];
}

export interface TocItem {
    id: string;
    text: string;
    level: number;
}
