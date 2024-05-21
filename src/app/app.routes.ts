import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./shows/shows.routes'),
  },

  {
    path: 'login',
    loadComponent: () => import('./core/components/auth/auth.component'),
  },
];

export default appRoutes;
