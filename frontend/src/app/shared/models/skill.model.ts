export interface SkillCategory {
    name: string;
    skills: Skill[];
}

export interface Skill {
    name: string;
    level: 'beginner' | 'intermediate' | 'medium' | 'advanced' | 'expert';
    icon: string;
}
