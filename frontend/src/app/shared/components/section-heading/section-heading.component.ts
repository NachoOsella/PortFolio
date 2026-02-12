import { Component, input } from '@angular/core';

@Component({
    selector: 'app-section-heading',
    standalone: true,
    templateUrl: './section-heading.component.html',
    styleUrl: './section-heading.component.css',
})
export class SectionHeadingComponent {
    title = input.required<string>();
    subtitle = input<string>();
}
