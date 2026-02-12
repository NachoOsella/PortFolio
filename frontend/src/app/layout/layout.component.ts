import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BackToTopComponent } from '../shared/components/back-to-top/back-to-top.component';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, FooterComponent, BackToTopComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.css',
})
export class LayoutComponent {}
