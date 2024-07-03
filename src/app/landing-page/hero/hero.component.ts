import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, RippleModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  public readonly $isImgLoading = signal<boolean>(true);

  public slidesArray = [1, 1, 1, 1, 1];
  public onImageLoad() {
    this.$isImgLoading.set(false);
  }

  @ViewChild('mySwiper') mySwiper?: ElementRef;
}
