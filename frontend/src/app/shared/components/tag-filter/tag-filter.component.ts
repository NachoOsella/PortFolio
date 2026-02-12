import { Component, input, output } from '@angular/core';

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

    selectTag(tag: string): void {
        this.tagSelected.emit(tag);
    }
}
