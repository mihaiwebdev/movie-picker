import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, RippleModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {}
