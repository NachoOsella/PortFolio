import { Component, ElementRef, ViewChild, input, output } from '@angular/core';
import {
    Bold,
    Code,
    Heading,
    Italic,
    Link,
    List,
    LucideAngularModule,
    Quote,
} from 'lucide-angular';

@Component({
    selector: 'app-markdown-editor',
    standalone: true,
    imports: [LucideAngularModule],
    templateUrl: './markdown-editor.component.html',
    styleUrl: './markdown-editor.component.css',
})
export class MarkdownEditorComponent {
    content = input<string>('');
    contentChange = output<string>();

    @ViewChild('textareaRef') textareaRef?: ElementRef<HTMLTextAreaElement>;

    readonly icons = { Bold, Italic, Code, Link, Heading, List, Quote };

    get wordCount(): number {
        const text = this.content().trim();
        if (!text) {
            return 0;
        }

        return text.split(/\s+/).length;
    }

    onInput(event: Event): void {
        const value = (event.target as HTMLTextAreaElement).value;
        this.contentChange.emit(value);
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Tab') {
            return;
        }

        event.preventDefault();
        this.insertAtCursor('  ');
    }

    insertMarkdown(prefix: string, suffix: string): void {
        const textarea = this.textareaRef?.nativeElement;
        if (!textarea) {
            return;
        }

        const value = this.content();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.slice(start, end);
        const next = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;

        this.contentChange.emit(next);

        requestAnimationFrame(() => {
            textarea.focus();
            const cursor = start + prefix.length + selected.length + suffix.length;
            textarea.setSelectionRange(cursor, cursor);
        });
    }

    private insertAtCursor(text: string): void {
        const textarea = this.textareaRef?.nativeElement;
        if (!textarea) {
            return;
        }

        const value = this.content();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const next = `${value.slice(0, start)}${text}${value.slice(end)}`;

        this.contentChange.emit(next);

        requestAnimationFrame(() => {
            textarea.focus();
            const cursor = start + text.length;
            textarea.setSelectionRange(cursor, cursor);
        });
    }
}
