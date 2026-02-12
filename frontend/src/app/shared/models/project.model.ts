export interface Project {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    image: string;
    category: string;
    technologies: string[];
    featured: boolean;
    links: {
        live: string | null;
        github: string | null;
    };
    highlights: string[];
    date: string;
}
