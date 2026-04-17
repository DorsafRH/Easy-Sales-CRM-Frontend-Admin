import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Intercepteur HTTP JWT — Easy Sales CRM.
 *
 * Responsabilités :
 * - Injecter le token JWT dans le header Authorization
 *   pour les requêtes vers les endpoints protégés
 * - Exclure les endpoints publics /auth/ pour éviter
 *   d'envoyer un token expiré qui provoquerait un 403
 * - Valider l'expiration du token avant envoi
 * - Rediriger vers /login en cas de réponse 401
 *
 * Triple condition avant injection du token :
 * 1. Token présent en localStorage
 * 2. Token non expiré (validé côté client)
 * 3. Endpoint nécessitant une authentification
 *
 * @author Riahi Dorsaf
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService  = inject(AuthService);
  const router       = inject(Router);
  const token        = authService.getToken();
  const isTokenValid = authService.isTokenValid();

  // Les endpoints /auth/** sont publics — ne jamais y injecter le token
  // Un token expiré en localStorage provoquerait un 403 Forbidden
  const isEndpointPublic = req.url.includes('/auth/');

  // Injection du token uniquement si les 3 conditions sont réunies
  const authReq = token && isTokenValid && !isEndpointPublic
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token expiré ou invalide côté serveur → déconnexion automatique
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};