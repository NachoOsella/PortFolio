import { Component, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Github, ArrowRight, FileText } from 'lucide-angular';

interface TerminalLine {
    id: number;
    key: string;
    value: string;
    typedValue: string;
    isTyped: boolean;
}

@Component({
    selector: 'app-hero-section',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './hero-section.component.html',
    styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent {
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly typingSpeedMs = 32;
    private readonly lineStartDelayMs = 90;

    readonly icons = { Github, ArrowRight, FileText };

    readonly socialLinks = [
        { label: 'GitHub', href: 'https://github.com/NachoOsella', icon: Github },
    ];

    readonly terminalLines = signal<TerminalLine[]>([
        { id: 1, key: 'name:', value: 'Ignacio Osella', typedValue: '', isTyped: false },
        { id: 2, key: 'role:', value: 'Backend Engineer', typedValue: '', isTyped: false },
        { id: 3, key: 'stack:', value: 'Java, Spring Boot, TypeScript', typedValue: '', isTyped: false },
        { id: 4, key: 'focus:', value: 'Distributed Systems, Clean APIs', typedValue: '', isTyped: false },
        { id: 5, key: 'location:', value: 'Cordoba, Argentina', typedValue: '', isTyped: false },
        { id: 6, key: 'status:', value: 'Available for work', typedValue: '', isTyped: false },
    ]);
    readonly activeTypingLineId = signal<number | null>(null);

    readonly allLinesTyped = computed(() => this.terminalLines().every((line) => line.isTyped));

    constructor() {
        afterNextRender(() => {
            if (!this.isBrowser) {
                return;
            }
            void this.startTypingAnimation();
        });
    }

    private async startTypingAnimation(): Promise<void> {
        const lines = this.terminalLines();

        await this.wait(300);

        for (const line of lines) {
            this.activeTypingLineId.set(line.id);
            await this.wait(this.lineStartDelayMs);

            for (let index = 1; index <= line.value.length; index += 1) {
                const nextText = line.value.slice(0, index);
                this.terminalLines.update((current) =>
                    current.map((entry) =>
                        entry.id === line.id ? { ...entry, typedValue: nextText } : entry
                    )
                );
                await this.wait(this.typingSpeedMs);
            }

            this.terminalLines.update((current) =>
                current.map((entry) => (entry.id === line.id ? { ...entry, isTyped: true } : entry))
            );
        }

        this.activeTypingLineId.set(null);
    }

    private wait(durationMs: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, durationMs);
        });
    }
}
