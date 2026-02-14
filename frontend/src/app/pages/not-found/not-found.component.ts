import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Home } from 'lucide-angular';
import { SeoService } from '../../core/services/seo.service';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.css',
})
export class NotFoundComponent implements OnInit {
    private readonly seo = inject(SeoService);

    readonly icons = { Home };

    ngOnInit(): void {
        this.seo.updateTitle('Page Not Found | Nacho.dev');
        this.seo.updateMetaTags({
            description: 'The page you are looking for does not exist.',
            robots: 'noindex, nofollow',
        });
    }
}
