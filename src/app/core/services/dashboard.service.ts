import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { PageResponse, EntrepriseCompteResponse } from '../models/entreprise.model';

/**
 * Statistiques agrégées affichées sur le Dashboard Super Admin.
 * Chaque champ correspond au nombre d'entreprises dans ce statut.
 */
export interface DashboardStats {
  total:      number;
  enAttente:  number;
  actives:    number;
  refusees:   number;
  suspendues: number;
}

/**
 * Service de statistiques pour le Dashboard Super Admin.
 *
 * Agrège les compteurs par statut en un seul appel parallèle
 * via forkJoin — évite les requêtes séquentielles.
 *
 * @author Riahi Dorsaf
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {

  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/entreprises`;

  // ── API ───────────────────────────────────────────────────

  /**
   * Charge les compteurs par statut en parallèle.
   * Effectue 5 requêtes simultanées et les agrège en un objet DashboardStats.
   */
  getStats(): Observable<DashboardStats> {
    const params = (statut?: string) => statut
      ? `?page=0&size=1&statut=${statut}`
      : `?page=0&size=1`;

    return forkJoin({
      total:      this.http.get<ApiResponse<PageResponse<EntrepriseCompteResponse>>>(`${this.apiUrl}${params()}`),
      enAttente:  this.http.get<ApiResponse<PageResponse<EntrepriseCompteResponse>>>(`${this.apiUrl}${params('EN_ATTENTE')}`),
      actives:    this.http.get<ApiResponse<PageResponse<EntrepriseCompteResponse>>>(`${this.apiUrl}${params('ACTIVE')}`),
      refusees:   this.http.get<ApiResponse<PageResponse<EntrepriseCompteResponse>>>(`${this.apiUrl}${params('REFUSE')}`),
      suspendues: this.http.get<ApiResponse<PageResponse<EntrepriseCompteResponse>>>(`${this.apiUrl}${params('SUSPENDU')}`)
    }).pipe(
      map(responses => ({
        total:      responses.total.data?.totalElements      ?? 0,
        enAttente:  responses.enAttente.data?.totalElements  ?? 0,
        actives:    responses.actives.data?.totalElements    ?? 0,
        refusees:   responses.refusees.data?.totalElements   ?? 0,
        suspendues: responses.suspendues.data?.totalElements ?? 0,
      }))
    );
  }
}