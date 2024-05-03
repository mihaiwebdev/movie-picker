import { Routes } from '@angular/router';

const ShowsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shows.component'),
  },
];

export default ShowsRoutes;
