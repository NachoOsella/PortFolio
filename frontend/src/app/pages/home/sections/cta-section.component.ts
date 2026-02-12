import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, FileText } from 'lucide-angular';

@Component({
    selector: 'app-cta-section',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './cta-section.component.html',
    styleUrl: './cta-section.component.css',
})
export class CtaSectionComponent {
    readonly icons = { Mail, FileText };
}
