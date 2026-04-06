import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import {
  EntrepriseCompteResponse,
  DecisionEntrepriseRequest,
  PageResponse,
} from '../models/entreprise.model';
import { SharedStateService } from './shared-state.service';

@Injectable({ providedIn: 'root' })
export class EntrepriseService {

  private readonly http        = inject(HttpClient);
  private readonly sharedState = inject(SharedStateService);
  private readonly apiUrl      = `${environment.apiUrl}/admin/entreprises`;

  getEntreprises(
    page = 0,
    size = 10,
    statut?: string
  ): Observable<ApiResponse<PageResponse<EntrepriseCompteResponse>>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (statut && statut !== 'TOUS') {
      params = params.set('statut', statut);
    }

    return this.http.get<ApiResponse<PageResponse<EntrepriseCompteResponse>>>(
      this.apiUrl, { params }
    );
  }

  getEntreprisesEnAttente(
    page = 0,
    size = 1
  ): Observable<ApiResponse<PageResponse<EntrepriseCompteResponse>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http
      .get<ApiResponse<PageResponse<EntrepriseCompteResponse>>>(
        `${this.apiUrl}/en-attente`, { params }
      )
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.sharedState.setNbEnAttente(response.data.totalElements);
          }
        })
      );
  }

  getEntrepriseById(id: number): Observable<ApiResponse<EntrepriseCompteResponse>> {
    return this.http.get<ApiResponse<EntrepriseCompteResponse>>(
      `${this.apiUrl}/${id}`
    );
  }

  prendreDecision(
    id: number,
    request: DecisionEntrepriseRequest,
    etaitEnAttente = false
  ): Observable<ApiResponse<EntrepriseCompteResponse>> {
    return this.http
      .post<ApiResponse<EntrepriseCompteResponse>>(
        `${this.apiUrl}/${id}/decision`, request
      )
      .pipe(
        tap(response => {
          if (response.success && etaitEnAttente) {
            this.sharedState.decrementeNbEnAttente();
          }
        })
      );
  }

  supprimerEntreprise(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}