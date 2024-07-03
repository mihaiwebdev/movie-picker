import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ContactUsComponent,
  FooterComponent,
  HeroComponent,
  HowItWorksComponent,
  NavbarComponent,
  QuestionsComponent,
  TeamComponent,
  TestimonialsComponent,
} from './';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    HowItWorksComponent,
    TestimonialsComponent,
    NavbarComponent,
    HeroComponent,
    QuestionsComponent,
    TeamComponent,
    ContactUsComponent,
    FooterComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {}

export default LandingPageComponent;
