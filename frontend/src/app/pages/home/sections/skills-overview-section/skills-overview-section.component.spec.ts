import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { ScrollAnimationService } from '../../../../core/services/scroll-animation.service';
import { SkillsOverviewSectionComponent } from './skills-overview-section.component';

describe('SkillsOverviewSectionComponent', () => {
    let component: SkillsOverviewSectionComponent;
    let injector: Injector;

    beforeEach(() => {
        injector = Injector.create({
            providers: [
                { provide: ApiService, useValue: {} },
                { provide: HttpClient, useValue: {} },
                { provide: ScrollAnimationService, useValue: { observe: () => undefined } },
            ],
        });

        component = runInInjectionContext(injector, () => new SkillsOverviewSectionComponent());
    });

    it('shows levels only for the active card', () => {
        component.setActiveCard(1);

        expect(component.shouldShowLevel(1)).toBe(true);
        expect(component.shouldShowLevel(0)).toBe(false);
    });

    it('clears active card on mouse leave', () => {
        component.setActiveCard(2);

        component.clearActiveCard(2);

        expect(component.activeCardIndex()).toBeNull();
    });

    it('keeps active card when focus moves within the same card', () => {
        const card = document.createElement('article');
        const child = document.createElement('button');
        card.appendChild(child);

        component.setActiveCard(0);

        component.clearActiveCard(
            0,
            { currentTarget: card, relatedTarget: child } as unknown as FocusEvent,
        );

        expect(component.activeCardIndex()).toBe(0);
    });
});
