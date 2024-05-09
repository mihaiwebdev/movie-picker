import { Routes } from '@angular/router';

const ShowsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shows.component'),
  },
  {
    path: 'movie',
    loadComponent: () => import('./show/show.component'),
  },
];

export default ShowsRoutes;
