import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../core/services/notification.service';
import { SharedStateService } from '../../core/services/shared-state.service';
import { NotificationResponse } from '../../core/models/notification.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

/**
 * Page Notifications — Easy Sales CRM.
 *
 * Liste paginée des notifications du Super Admin.
 * Permet de marquer les notifications comme lues
 * individuellement ou toutes en une seule action.
 *
 * @author Riahi Dorsaf
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {

  private readonly notificationService = inject(NotificationService);
  private readonly sharedState         = inject(SharedStateService);

  /** Liste des notifications de la page courante. */
  readonly notifications = signal<NotificationResponse[]>([]);

  /** True pendant le chargement des notifications. */
  readonly isLoading = signal<boolean>(false);

  /** Nombre total de notifications toutes pages confondues. */
  readonly totalElements = signal<number>(0);

  /**
   * True si au moins une notification n'est pas lue.
   * Computed car dérivé du signal notifications().
   * Recalculé uniquement quand notifications() change — mémoïsé.
   */
  readonly aNonLues = computed(() =>
    this.notifications().some(n => !n.lue)
  );

  /** Page courante (0-indexed). */
  currentPage = 0;

  /** Nombre total de pages disponibles. */
  totalPages = 0;

  /** Nombre de notifications par page. */
  readonly pageSize = 20;

  ngOnInit(): void {
    this.chargerNotifications(0);
  }

  // ── Chargement ────────────────────────────────────────────

  /**
   * Charge les notifications paginées depuis l'API.
   * @param page numéro de page (0-indexed)
   */
  chargerNotifications(page: number): void {
    this.isLoading.set(true);
    this.notificationService.getNotifications(page, this.pageSize).subscribe({
      next: response => {
        if (response.success && response.data) {
          this.notifications.set(response.data.content);
          this.totalElements.set(response.data.totalElements);
          this.totalPages  = response.data.totalPages;
          this.currentPage = response.data.page;
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // ── Actions ───────────────────────────────────────────────

  /**
   * Marque une notification comme lue et décrémente le badge sidebar.
   * Sans effet si la notification est déjà lue.
   * @param notification la notification à marquer
   */
  marquerCommeLue(notification: NotificationResponse): void {
    if (notification.lue) return;

    this.notificationService.marquerCommeLue(notification.id).subscribe({
      next: () => {
        // Mise à jour locale sans rechargement de la liste
        this.notifications.update(list =>
          list.map(n => n.id === notification.id ? { ...n, lue: true } : n)
        );
        this.sharedState.decrementeNbNotifications();
      }
    });
  }

  /**
   * Marque toutes les notifications comme lues et remet le badge à zéro.
   */
  marquerToutesCommeLues(): void {
    this.notificationService.marquerToutesCommeLues().subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => ({ ...n, lue: true }))
        );
        this.sharedState.resetNbNotifications();
      }
    });
  }

  // ── Navigation pagination ─────────────────────────────────

  /**
   * Navigue vers une page de notifications.
   * @param page numéro de page (0-indexed)
   */
  goToPage(page: number): void {
    this.chargerNotifications(page);
  }

  /** Retourne un tableau d'indices de pages pour la pagination. */
  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  // ── Helpers ───────────────────────────────────────────────

  /**
   * Formate une date ISO en format lisible français.
   * @param iso date au format ISO 8601
   */
  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  /**
   * Retourne l'identifiant d'icône correspondant au type de notification.
   * @param type type de notification backend
   */
  iconeType(type: string): string {
    const map: Record<string, string> = {
      NOUVELLE_INSCRIPTION:    'inscription',
      MODIFICATION_ENTREPRISE: 'modification',
      INFO:                    'info',
    };
    return map[type] ?? 'info';
  }
}