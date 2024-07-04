import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.css',
})
export class HowItWorksComponent {
  private readonly messageService = inject(MessageService);
  videoSrc = '../../../assets/video/movie-picker-demo.mp4';

  public onGetStarted() {
    this.messageService.add({
      severity: 'info',
      summary: 'The Launch is on Monday 8 July',
      detail: 'Sign up to get notified about it!',
    });
  }
}
