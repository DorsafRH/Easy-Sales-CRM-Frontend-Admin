import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Configuration des routes de l'application — Easy Sales CRM.
 *
 * Architecture :
 * - /login          → page de connexion (publique)
 * - /admin          → layout principal protégé par authGuard
 *   - /dashboard    → tableau de bord (page d'accueil après connexion)
 *   - /entreprises  → liste et détail des entreprises
 *   - /notifications → page des notifications
 *
 * Lazy loading activé sur tous les composants pour optimiser
 * le temps de chargement initial.
 *
 * @author Riahi Dorsaf
 */
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
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
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
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component')
            .then(m => m.NotificationsComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];