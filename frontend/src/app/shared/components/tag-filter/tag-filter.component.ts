import { Component, computed, input, output } from '@angular/core';

@Component({
    selector: 'app-tag-filter',
    standalone: true,
    templateUrl: './tag-filter.component.html',
    styleUrl: './tag-filter.component.css',
})
export class TagFilterComponent {
    tags = input.required<string[]>();
    selectedTag = input<string>('all');
    tagSelected = output<string>();

    visibleTags = computed(() => {
        const uniqueTags = new Map<string, string>();

        this.tags().forEach((tag) => {
            const value = tag.trim();
            const normalized = value.toLowerCase();
            if (!normalized || normalized === 'all' || uniqueTags.has(normalized)) {
                return;
            }

            uniqueTags.set(normalized, value);
        });

        return Array.from(uniqueTags.values());
    });

    selectTag(tag: string): void {
        this.tagSelected.emit(tag);
    }
}
