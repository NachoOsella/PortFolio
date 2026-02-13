import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Github, Mail } from 'lucide-angular';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
})
export class FooterComponent {
    readonly currentYear = new Date().getFullYear();

    readonly socialLinks = [
        {
            label: 'GitHub',
            href: 'https://github.com/NachoOsella',
            icon: Github,
        },
        {
            label: 'Email',
            href: 'mailto:hello@nacho.dev',
            icon: Mail,
        },
    ];

    readonly quickLinks = [
        { label: 'Home', path: '/' },
        { label: 'Projects', path: '/projects' },
        { label: 'Blog', path: '/blog' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
    ];
}
