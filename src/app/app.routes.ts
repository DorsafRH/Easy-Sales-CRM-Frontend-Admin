import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'entreprises',
        pathMatch: 'full',
      },
      {
        path: 'entreprises',
        loadComponent: () =>
          import('./features/entreprises/list/entreprises-list.component')
            .then(m => m.EntreprisesListComponent),
      },
      {
        path: 'entreprises/:id',
        loadComponent: () =>
          import('./features/entreprises/detail/entreprise-detail.component')
            .then(m => m.EntrepriseDetailComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];