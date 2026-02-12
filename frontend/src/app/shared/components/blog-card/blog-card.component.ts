import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, Calendar, Clock } from 'lucide-angular';
import { BlogPost } from '../../models/blog.model';

@Component({
    selector: 'app-blog-card',
    standalone: true,
    imports: [RouterLink, DatePipe, LucideAngularModule],
    templateUrl: './blog-card.component.html',
    styleUrl: './blog-card.component.css',
})
export class BlogCardComponent {
    post = input.required<BlogPost>();

    readonly icons = { ArrowRight, Calendar, Clock };
}
