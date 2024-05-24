import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing-page/landing-page.component'),
  },
  {
    path: 'app',
    loadChildren: () => import('./app.routes'),
  },

  // Wildcard route
  {
    path: '**',
    redirectTo: '/app',
    pathMatch: 'full',
  },
];
