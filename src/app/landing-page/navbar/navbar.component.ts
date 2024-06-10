import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RippleModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {}