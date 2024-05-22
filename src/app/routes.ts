import { Routes } from '@angular/router';

export const routes: Routes = [
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
