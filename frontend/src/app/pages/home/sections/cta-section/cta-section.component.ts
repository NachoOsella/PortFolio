import { Component, ElementRef, viewChild, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, FileText } from 'lucide-angular';
import { ScrollAnimationService } from '../../../../core/services/scroll-animation.service';

@Component({
    selector: 'app-cta-section',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './cta-section.component.html',
    styleUrl: './cta-section.component.css',
})
export class CtaSectionComponent {
    readonly icons = { Mail, FileText };

    private readonly scrollAnimationService = inject(ScrollAnimationService);
    readonly ctaCard = viewChild.required<ElementRef<HTMLDivElement>>('ctaCard');

    constructor() {
        effect(() => {
            const card = this.ctaCard();
            if (card) {
                this.scrollAnimationService.observe(card.nativeElement);
            }
        });
    }
}
