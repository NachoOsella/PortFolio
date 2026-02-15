import { AfterViewInit, Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { ScrollAnimationService } from '../../../core/services/scroll-animation.service';

@Component({
    selector: 'app-section-heading',
    standalone: true,
    templateUrl: './section-heading.component.html',
    styleUrl: './section-heading.component.css',
})
export class SectionHeadingComponent implements AfterViewInit {
    title = input.required<string>();
    subtitle = input<string>();

    readonly headingContainer = viewChild.required<ElementRef<HTMLDivElement>>('headingContainer');
    private readonly scrollAnimationService = inject(ScrollAnimationService);

    ngAfterViewInit(): void {
        this.scheduleObservation();
    }

    private scheduleObservation(): void {
        const observeHeading = () => {
            this.scrollAnimationService.observe(this.headingContainer().nativeElement);
        };

        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => {
                requestAnimationFrame(observeHeading);
            });
            return;
        }

        setTimeout(observeHeading, 0);
    }
}
