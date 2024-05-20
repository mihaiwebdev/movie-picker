import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing-page/landing-page.component'),
  },
  {
    path: 'app',
    loadChildren: () => import('./shows/shows.routes'),
  },

  // Wildcard route
  // {
  //   path: '**',
  //   loadChildren: () => import('./shows/shows.routes'),
  // },
];
