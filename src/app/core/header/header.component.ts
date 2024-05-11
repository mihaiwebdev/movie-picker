import { Component } from '@angular/core';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RippleModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {}
