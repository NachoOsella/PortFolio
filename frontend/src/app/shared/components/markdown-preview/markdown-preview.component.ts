import { Component, input, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-markdown-preview',
    standalone: true,
    templateUrl: './markdown-preview.component.html',
    styleUrl: './markdown-preview.component.css',
})
export class MarkdownPreviewComponent {
    content = input<string>('');
    renderedHtml = signal<string>('');

    private platformId = inject(PLATFORM_ID);

    constructor() {
        effect(() => {
            const markdown = this.content();
            if (isPlatformBrowser(this.platformId) && markdown) {
                this.renderMarkdown(markdown);
            } else {
                this.renderedHtml.set('');
            }
        });
    }

    private renderMarkdown(markdown: string): void {
        let html = markdown;

        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, language: string, code: string) => {
            const highlighted = this.highlightCode(code, language);
            return `<pre class="code-block"><code class="language-${language || 'text'}">${highlighted}</code></pre>`;
        });

        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        html = html.replace(/`(.+?)`/g, (_, code: string) => {
            return `<code>${this.escapeHtml(code)}</code>`;
        });

        html = html.replace(
            /\[(.+?)\]\((.+?)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
        );

        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

        html = html.replace(/^(?!<[hluobp]|<li|<pre|<code|<\/)(.+)$/gm, '<p>$1</p>');

        html = html.replace(/\n{2,}/g, '\n');

        this.renderedHtml.set(html);
    }

    private highlightCode(code: string, language: string): string {
        const escaped = this.escapeHtml(code);
        const lang = language.toLowerCase();

        if (!['ts', 'typescript', 'js', 'javascript', 'json', 'html', 'css', 'bash'].includes(lang)) {
            return escaped;
        }

        return escaped
            .replace(/\b(const|let|var|function|return|if|else|for|while|switch|case|break|import|from|export|class|new|async|await|try|catch|throw|true|false|null|undefined)\b/g, '<span class="token-keyword">$1</span>')
            .replace(/("[^"]*"|'[^']*'|`[^`]*`)/g, '<span class="token-string">$1</span>')
            .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="token-number">$1</span>')
            .replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>');
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
