import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, RippleModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  private readonly messageService = inject(MessageService);
  public readonly $isImgLoading = signal<boolean>(true);

  public slidesArray = [1, 1, 1, 1, 1];
  public onImageLoad() {
    this.$isImgLoading.set(false);
  }

  @ViewChild('mySwiper') mySwiper?: ElementRef;

  public onGetStarted() {
    this.messageService.add({
      severity: 'info',
      summary: 'The Launch is on Monday 8 July',
      detail: 'Sign up to get notified about it!',
    });
  }
}
