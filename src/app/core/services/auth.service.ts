import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, LoginRequest } from '../models/auth.model';
import { SharedStateService } from './shared-state.service';

const TOKEN_KEY = 'crm_access_token';
const USER_KEY  = 'crm_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http        = inject(HttpClient);
  private readonly router      = inject(Router);
  private readonly sharedState = inject(SharedStateService);
  private readonly apiUrl      = `${environment.apiUrl}/auth`;

  constructor() {
    this.restoreSession();
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
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

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

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
    if (stored) {
      try {
        const user: AuthResponse = JSON.parse(stored);
        this.sharedState.setCurrentUser(user);
      } catch {
        this.clearSession();
      }
    }
  }
}