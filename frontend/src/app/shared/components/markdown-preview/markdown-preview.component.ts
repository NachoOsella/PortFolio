import { Component, input } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
    selector: 'app-markdown-preview',
    standalone: true,
    imports: [MarkdownModule],
    templateUrl: './markdown-preview.component.html',
    styleUrl: './markdown-preview.component.css',
})
export class MarkdownPreviewComponent {
    content = input<string>('');
}
