import { Routes } from '@angular/router';
import { userAuthGuard } from './core/guards/user-auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./shows/shows.routes'),
  },

  {
    path: 'login',
    loadComponent: () => import('./core/components/auth/auth.component'),
  },

  {
    path: 'bookmarks',
    loadComponent: () => import('./bookmarks/bookmarks.component'),
    canActivate: [userAuthGuard],
  },
];

export default appRoutes;
