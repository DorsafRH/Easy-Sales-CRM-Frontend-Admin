import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { NotificationResponse, PageResponse } from '../models/notification.model';
import { SharedStateService } from './shared-state.service';

/**
 * Service de gestion des notifications Super Admin.
 *
 * Expose les appels API pour lister, marquer comme lues
 * et compter les notifications non lues.
 *
 * Démarre un polling toutes les 30 secondes pour mettre
 * à jour le badge de la sidebar en temps quasi-réel.
 *
 * @author Riahi Dorsaf
 */
@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

  private readonly http        = inject(HttpClient);
  private readonly sharedState = inject(SharedStateService);
  private readonly apiUrl      = `${environment.apiUrl}/admin/notifications`;

  /** Intervalle de polling en millisecondes (30 secondes). */
  private readonly POLLING_INTERVAL_MS = 30000;

  /** Souscription active au polling — null si polling arrêté. */
  private pollingSubscription: Subscription | null = null;

  // ── Appels API ────────────────────────────────────────────

  /**
   * Récupère les notifications paginées triées par date décroissante.
   * @param page numéro de page (0-indexed)
   * @param size nombre d'éléments par page
   */
  getNotifications(
    page = 0,
    size = 20
  ): Observable<ApiResponse<PageResponse<NotificationResponse>>> {
    return this.http.get<ApiResponse<PageResponse<NotificationResponse>>>(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }

  /**
   * Retourne le nombre de notifications non lues.
   * Appelé par le polling pour mettre à jour le badge sidebar.
   */
  compterNonLues(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/non-lues/count`
    );
  }

  /**
   * Marque une notification comme lue.
   * @param id identifiant de la notification
   */
  marquerCommeLue(id: number): Observable<ApiResponse<NotificationResponse>> {
    return this.http.patch<ApiResponse<NotificationResponse>>(
      `${this.apiUrl}/${id}/lue`, {}
    );
  }

  /**
   * Marque toutes les notifications comme lues en une seule requête.
   */
  marquerToutesCommeLues(): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.apiUrl}/tout-lire`, {}
    );
  }

  // ── Polling ───────────────────────────────────────────────

  /**
   * Démarre le polling toutes les 30 secondes.
   * Met à jour le signal nbNotificationsNonLues dans SharedStateService.
   * Appelé dans MainLayoutComponent.ngOnInit().
   * Sans effet si le polling est déjà actif.
   */
  startPolling(): void {
    if (this.pollingSubscription) return;

    this.pollingSubscription = timer(0, this.POLLING_INTERVAL_MS)
      .pipe(
        switchMap(() => this.compterNonLues())
      )
      .subscribe({
        next: response => {
          if (response.success) {
            this.sharedState.setNbNotificationsNonLues(response.data);
          }
        },
        error: () => {}
      });
  }

  /**
   * Arrête le polling et libère la souscription.
   * Appelé dans MainLayoutComponent.ngOnDestroy().
   */
  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = null;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}