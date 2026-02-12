import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Github, Linkedin, Twitter, Mail, Heart } from 'lucide-angular';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
})
export class FooterComponent {
    readonly currentYear = new Date().getFullYear();

    readonly icons = { Github, Linkedin, Twitter, Mail, Heart };

    readonly socialLinks = [
        {
            label: 'GitHub',
            href: 'https://github.com/NachoOsella',
            icon: Github,
        },
        {
            label: 'LinkedIn',
            href: 'https://linkedin.com/in/',
            icon: Linkedin,
        },
        {
            label: 'Twitter',
            href: 'https://twitter.com/',
            icon: Twitter,
        },
        {
            label: 'Email',
            href: 'mailto:contact@example.com',
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
