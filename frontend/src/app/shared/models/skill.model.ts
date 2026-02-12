export interface SkillCategory {
    name: string;
    skills: Skill[];
}

export interface Skill {
    name: string;
    level: 'beginner' | 'intermediate' | 'expert';
    icon: string;
}
