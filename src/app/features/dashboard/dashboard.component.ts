import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

/**
 * Dashboard Super Admin — Easy Sales CRM.
 *
 * Affiche les compteurs par statut des comptes entreprises
 * sous forme de cartes cliquables qui redirigent vers la
 * liste filtrée correspondante.
 *
 * @author Riahi Dorsaf
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);
  private readonly router           = inject(Router);

  /** Statistiques chargées depuis l'API — null pendant le chargement. */
  readonly stats = signal<DashboardStats | null>(null);

  /** True pendant le chargement initial des statistiques. */
  readonly isLoading = signal<boolean>(false);

  /**
   * Configuration des cartes statistiques affichées sur le dashboard.
   * Chaque carte mappe un statut à une couleur, une icône et un filtre de navigation.
   */
  readonly cartes = [
    {
      label:   'Total entreprises',
      key:     'total'      as keyof DashboardStats,
      icon:    'total',
      couleur: 'primary',
      filtre:  null,
    },
    {
      label:   'En attente',
      key:     'enAttente'  as keyof DashboardStats,
      icon:    'attente',
      couleur: 'warning',
      filtre:  'EN_ATTENTE',
    },
    {
      label:   'Actives',
      key:     'actives'    as keyof DashboardStats,
      icon:    'active',
      couleur: 'success',
      filtre:  'ACTIVE',
    },
    {
      label:   'Refusées',
      key:     'refusees'   as keyof DashboardStats,
      icon:    'refuse',
      couleur: 'danger',
      filtre:  'REFUSE',
    },
    {
      label:   'Suspendues',
      key:     'suspendues' as keyof DashboardStats,
      icon:    'suspendu',
      couleur: 'suspended',
      filtre:  'SUSPENDU',
    },
  ];

  ngOnInit(): void {
    this.chargerStats();
  }

  // ── Chargement ────────────────────────────────────────────

  /** Charge les statistiques depuis l'API via DashboardService. */
  private chargerStats(): void {
    this.isLoading.set(true);
    this.dashboardService.getStats().subscribe({
      next: stats => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // ── Navigation ────────────────────────────────────────────

  /**
   * Navigue vers la liste entreprises avec un filtre optionnel.
   * @param filtre statut à filtrer ou null pour afficher tout
   */
  naviguerVersListe(filtre: string | null): void {
    if (filtre) {
      this.router.navigate(
        ['/admin/entreprises'],
        { queryParams: { statut: filtre } }
      );
    } else {
      this.router.navigate(['/admin/entreprises']);
    }
  }

  // ── Helpers ───────────────────────────────────────────────

  /**
   * Retourne la valeur d'un compteur depuis les statistiques chargées.
   * @param key clé du compteur dans DashboardStats
   */
  getValeur(key: keyof DashboardStats): number {
    return this.stats()?.[key] ?? 0;
  }
}