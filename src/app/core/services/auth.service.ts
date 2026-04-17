import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, LoginRequest } from '../models/auth.model';
import { SharedStateService } from './shared-state.service';

const TOKEN_KEY = 'crm_access_token';
const USER_KEY  = 'crm_current_user';

/**
 * Service d'authentification — Easy Sales CRM.
 *
 * Responsabilités :
 * - Connexion / déconnexion
 * - Persistance de la session en localStorage
 * - Validation de l'expiration du token JWT côté client
 *
 * Sécurité : la validation côté client est une optimisation
 * pour éviter les requêtes inutiles. La vraie validation
 * de sécurité reste côté serveur dans JwtAuthFilter.java.
 *
 * @author Riahi Dorsaf
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http        = inject(HttpClient);
  private readonly router      = inject(Router);
  private readonly sharedState = inject(SharedStateService);
  private readonly apiUrl      = `${environment.apiUrl}/auth`;

  constructor() {
    this.restoreSession();
  }

  // ── Authentification ──────────────────────────────────────────────

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    // Vider la session existante avant toute tentative de connexion
    // Evite d'envoyer un ancien token invalide avec la requête
    this.clearSession();

    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveSession(response.data);
          }
        })
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ── Gestion du token ──────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Vérifie si le token JWT stocké est encore valide côté client.
   *
   * Décode le payload Base64 du token et compare la date d'expiration
   * avec l'heure actuelle. Retourne false si le token est absent,
   * malformé ou expiré.
   *
   * Structure JWT : header.payload.signature
   * Le payload contient le champ "exp" en secondes (timestamp Unix).
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Le payload est la deuxième partie du JWT (index 1)
      const payload = JSON.parse(atob(token.split('.')[1]));

      // exp est en secondes → convertir en millisecondes pour Date.now()
      const expirationMs = payload.exp * 1000;

      return Date.now() < expirationMs;
    } catch {
      // Token malformé → considéré invalide
      return false;
    }
  }

  // ── Session ───────────────────────────────────────────────────────

  private saveSession(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth));
    this.sharedState.setCurrentUser(auth);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.sharedState.clearCurrentUser();
  }

  private restoreSession(): void {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return;

    try {
      const user: AuthResponse = JSON.parse(stored);
      this.sharedState.setCurrentUser(user);
    } catch {
      // Données corrompues → nettoyer
      this.clearSession();
    }
  }
}