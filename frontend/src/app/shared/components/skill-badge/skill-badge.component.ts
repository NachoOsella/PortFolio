import { Component, input } from '@angular/core';
import {
    Brain,
    Database,
    Globe,
    Handshake,
    Languages,
    Layers,
    LucideAngularModule,
    MessageSquare,
    Network,
    Route,
    Shield,
    Users,
    Waypoints,
    Workflow,
} from 'lucide-angular';
import { Skill } from '../../models/skill.model';

@Component({
    selector: 'app-skill-badge',
    standalone: true,
    imports: [LucideAngularModule],
    templateUrl: './skill-badge.component.html',
    styleUrl: './skill-badge.component.css',
})
export class SkillBadgeComponent {
    skill = input.required<Skill>();
    showLevel = input(false);
    imgError = false;
    readonly icons = {
        Brain,
        Database,
        Globe,
        Handshake,
        Languages,
        Layers,
        MessageSquare,
        Network,
        Route,
        Shield,
        Users,
        Waypoints,
        Workflow,
    };

    get iconUrl(): string | null {
        const slug = this.normalizeIconName(this.skill().icon || this.skill().name);
        return slug ? `https://cdn.simpleicons.org/${slug}` : null;
    }

    get levelValue(): number {
        switch (this.skill().level) {
            case 'expert':
                return 90;
            case 'advanced':
                return 75;
            case 'medium':
                return 50;
            case 'intermediate':
                return 60;
            case 'beginner':
                return 30;
            default:
                return 50;
        }
    }

    get fallbackIcon() {
        const normalized = this.normalizeIconName(this.skill().icon || this.skill().name);
        const iconMap: Record<string, (typeof this.icons)[keyof typeof this.icons]> = {
            api: this.icons.Network,
            gateway: this.icons.Route,
            microservices: this.icons.Waypoints,
            architecture: this.icons.Layers,
            ddd: this.icons.Layers,
            database: this.icons.Database,
            english: this.icons.Languages,
            scrum: this.icons.Workflow,
            agile: this.icons.Workflow,
            teamwork: this.icons.Users,
            problemsolving: this.icons.Brain,
            communication: this.icons.MessageSquare,
            security: this.icons.Shield,
            restapi: this.icons.Network,
            // Additional mappings for skills without icons
            sql: this.icons.Database,
            'jpa/hibernate': this.icons.Database,
            restapidesign: this.icons.Network,
            microservicesarchitecture: this.icons.Waypoints,
            apigatewaypattern: this.icons.Route,
            cleanarchitecture: this.icons.Layers,
            'domain-drivendesign(ddd)': this.icons.Layers,
            rxjs: this.icons.Network,
            'english(c1-advanced)': this.icons.Languages,
            'scrum(psmi)': this.icons.Workflow,
            agilemethodology: this.icons.Workflow,
            teamcollaboration: this.icons.Users,
            technicalcommunication: this.icons.MessageSquare,
            default: this.icons.Globe,
        };

        return (normalized && iconMap[normalized]) || iconMap['default'];
    }

    private normalizeIconName(name: string): string | null {
        const lower = name.toLowerCase();

        // Mapping of skill names to Simple Icons slugs
        const simpleIconsMap: Record<string, string> = {
            'node.js': 'nodedotjs',
            'next.js': 'nextdotjs',
            'c++': 'cplusplus',
            'c#': 'csharp',
            aws: 'amazonaws',
            'google cloud': 'googlecloud',
            'ms sql': 'microsoftsqlserver',
            '.net': 'dotnet',
            express: 'express',
            html5: 'html5',
            css3: 'css3',
            'visual studio code': 'visualstudiocode',
            'vs code': 'visualstudiocode',
            // Add more technology mappings as needed
            typescript: 'typescript',
            javascript: 'javascript',
            java: 'java',
            python: 'python',
            angular: 'angular',
            react: 'react',
            vue: 'vuedotjs',
            spring: 'spring',
            'spring boot': 'springboot',
            postgresql: 'postgresql',
            mysql: 'mysql',
            mongodb: 'mongodb',
            redis: 'redis',
            kafka: 'apachekafka',
            docker: 'docker',
            kubernetes: 'kubernetes',
            jenkins: 'jenkins',
            git: 'git',
            github: 'github',
            gitlab: 'gitlab',
            jira: 'jira',
            terraform: 'terraform',
            nginx: 'nginx',
            linux: 'linux',
            'intellij idea': 'intellijidea',
        };

        const mapped = simpleIconsMap[lower];
        if (mapped) return mapped;

        // Check if it's a conceptual/soft skill that has no Simple Icon
        const noIconSkills = [
            'sql',
            'jpa',
            'hibernate',
            'jpa/hibernate',
            'restapidesign',
            'rest api design',
            'microservicesarchitecture',
            'microservices architecture',
            'apigatewaypattern',
            'api gateway pattern',
            'apigateway',
            'api gateway',
            'cleanarchitecture',
            'clean architecture',
            'ddd',
            'domain-drivendesign(ddd)',
            'domain-driven design',
            'domain driven design',
            'rxjs',
            'english',
            'english(c1-advanced)',
            'scrum',
            'scrum(psmi)',
            'agile',
            'agilemethodology',
            'agile methodology',
            'teamcollaboration',
            'team collaboration',
            'problemsolving',
            'problem solving',
            'technicalcommunication',
            'technical communication',
            'teamwork',
            'communication',
            'architecture',
            'restapi',
            'rest api',
            'microservices',
            'gateway',
            'api',
        ];

        if (noIconSkills.includes(lower)) {
            return null;
        }

        // For anything else, try the normalized version
        return lower.replace(/\s+/g, '');
    }

    levelClass(): string {
        switch (this.skill().level) {
            case 'expert':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'beginner':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    }
}
