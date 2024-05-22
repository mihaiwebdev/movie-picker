import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./shows/shows.routes'),
  },
];

export default appRoutes;
