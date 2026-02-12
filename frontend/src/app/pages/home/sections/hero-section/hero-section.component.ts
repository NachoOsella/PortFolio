import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Github, Linkedin, ArrowRight, FileText, MapPin } from 'lucide-angular';

@Component({
    selector: 'app-hero-section',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './hero-section.component.html',
    styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent {
    readonly icons = { Github, Linkedin, ArrowRight, FileText, MapPin };

    readonly socialLinks = [
        { label: 'GitHub', href: 'https://github.com/NachoOsella', icon: Github },
        { label: 'LinkedIn', href: 'https://linkedin.com/in/', icon: Linkedin },
    ];
}
