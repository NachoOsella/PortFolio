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

    get iconUrl(): string {
        const slug = this.normalizeIconName(this.skill().icon || this.skill().name);
        return `https://cdn.simpleicons.org/${slug}`;
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

        return iconMap[normalized] || iconMap['default'];
    }

    private normalizeIconName(name: string): string {
        const lower = name.toLowerCase();
        const map: Record<string, string> = {
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
        };
        return map[lower] || lower.replace(/\s+/g, '');
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
