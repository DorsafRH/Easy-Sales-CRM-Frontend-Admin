import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { SharedStateService } from '../services/shared-state.service';

/**
 * Guard de protection des routes du backoffice Super Admin.
 *
 * Vérifie deux conditions avant d'autoriser l'accès à une route protégée :
 * 1. L'utilisateur est authentifié (token JWT valide en localStorage)
 * 2. L'utilisateur possède le rôle ROLE_SUPER_ADMIN
 *
 * Si l'une des conditions échoue, l'utilisateur est redirigé vers /login.
 *
 * @author Riahi Dorsaf
 */
export const authGuard: CanActivateFn = () => {
  // ── Injection des dépendances ──────────────────────────────

  const authService  = inject(AuthService);
  const sharedState  = inject(SharedStateService);
  const router       = inject(Router);

  // ── Vérification de l'authentification ────────────────────

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // ── Vérification du rôle Super Admin ──────────────────────

  const user = sharedState.currentUser();
  if (!user || user.role !== 'ROLE_SUPER_ADMIN') {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
