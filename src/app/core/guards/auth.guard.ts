import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { SharedStateService } from '../services/shared-state.service';

export const authGuard: CanActivateFn = () => {
  const authService  = inject(AuthService);
  const sharedState  = inject(SharedStateService);
  const router       = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = sharedState.currentUser();
  if (!user || user.role !== 'ROLE_SUPER_ADMIN') {
    router.navigate(['/login']);
    return false;
  }

  return true;
};