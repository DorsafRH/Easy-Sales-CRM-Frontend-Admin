import {
  Component, OnInit, inject, signal, computed, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EntrepriseService } from '../../../core/services/entreprise.service';
import { SharedStateService } from '../../../core/services/shared-state.service';
import {
  EntrepriseCompteResponse,
  StatutCompte,
  DecisionEntrepriseRequest,
} from '../../../core/models/entreprise.model';
import { BadgeStatutComponent } from '../../../shared/components/badge-statut/badge-statut.component';
import { ConfirmDialogComponent, ConfirmDialogConfig } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-entreprises-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    BadgeStatutComponent, ConfirmDialogComponent,
    SpinnerComponent, EmptyStateComponent,
  ],
  templateUrl: './entreprises-list.component.html',
  styleUrl: './entreprises-list.component.scss',
})
export class EntreprisesListComponent implements OnInit {
  private readonly entrepriseService = inject(EntrepriseService);
  readonly sharedState               = inject(SharedStateService);

  // Signal local justifié : tableau + pagination réagissent ensemble
  readonly entreprises = signal<EntrepriseCompteResponse[]>([]);

  isLoading     = false;
  currentPage   = 0;
  totalPages    = 0;
  totalElements = 0;
  readonly pageSize = 10;

  readonly nbEnAttente = this.sharedState.nbEntreprisesEnAttente;

  // Filtrage textuel local via computed()
  readonly entreprisesFiltered = computed(() => {
    const recherche = this.sharedState.filtres().recherche.toLowerCase().trim();
    if (!recherche) return this.entreprises();
    return this.entreprises().filter(e =>
      e.nomEntreprise.toLowerCase().includes(recherche) ||
      e.matriculeFiscale.toLowerCase().includes(recherche) ||
      `${e.proprietairePrenom} ${e.proprietaireNom}`.toLowerCase().includes(recherche)
    );
  });

  // Dialog
  dialogOpen                           = false;
  dialogConfig!: ConfirmDialogConfig;
  private selectedEntreprise: EntrepriseCompteResponse | null = null;
  private pendingAction: 'valider' | 'refuser' | 'supprimer' | null = null;

  readonly filtreOptions = [
    { label: 'Toutes',     value: 'TOUS'       as const },
    { label: 'En attente', value: 'EN_ATTENTE' as const },
    { label: 'Actives',    value: 'ACTIVE'     as const },
    { label: 'Refusées',   value: 'REFUSE'     as const },
    { label: 'Suspendues', value: 'SUSPENDU'   as const },
  ];

  constructor() {
    // Recharge la liste quand le filtre statut change
    effect(() => {
      const statut = this.sharedState.filtres().statut;
      this.currentPage = 0;
      this.chargerEntreprises(0, statut === 'TOUS' ? undefined : statut);
    });
  }

  ngOnInit(): void {}

  chargerEntreprises(page: number, statut?: string): void {
    this.isLoading = true;
    this.entrepriseService.getEntreprises(page, this.pageSize, statut).subscribe({
      next: response => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.entreprises.set(response.data.content);
          this.totalPages    = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.currentPage   = response.data.page;
        }
      },
      error: () => { this.isLoading = false; },
    });
  }

  onFiltreChange(statut: StatutCompte | 'TOUS'): void {
    this.sharedState.setFiltreStatut(statut);
  }

  resetFiltres(): void {
    this.sharedState.resetFiltres();
  }

  goToPage(page: number): void {
    const statut = this.sharedState.filtres().statut;
    this.chargerEntreprises(page, statut === 'TOUS' ? undefined : statut);
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  ouvrirDialogValider(e: EntrepriseCompteResponse): void {
    this.selectedEntreprise = e;
    this.pendingAction      = 'valider';
    this.dialogConfig = {
      title:          'Valider cette entreprise',
      message:        `Voulez-vous activer le compte de "${e.nomEntreprise}" ?`,
      confirmLabel:   'Valider',
      confirmVariant: 'success',
    };
    this.dialogOpen = true;
  }

  ouvrirDialogRefuser(e: EntrepriseCompteResponse): void {
    this.selectedEntreprise = e;
    this.pendingAction      = 'refuser';
    this.dialogConfig = {
      title:          'Refuser cette entreprise',
      message:        `Vous êtes sur le point de refuser la demande de "${e.nomEntreprise}".`,
      confirmLabel:   'Refuser',
      confirmVariant: 'danger',
      showMotif:      true,
      motifRequired:  true,
    };
    this.dialogOpen = true;
  }

  ouvrirDialogSupprimer(e: EntrepriseCompteResponse): void {
    this.selectedEntreprise = e;
    this.pendingAction      = 'supprimer';
    this.dialogConfig = {
      title:          'Supprimer cette entreprise',
      message:        `Action irréversible. Supprimer "${e.nomEntreprise}" ?`,
      confirmLabel:   'Supprimer',
      confirmVariant: 'danger',
    };
    this.dialogOpen = true;
  }

  closeDialog(): void {
    this.dialogOpen         = false;
    this.selectedEntreprise = null;
    this.pendingAction      = null;
  }

  onDialogConfirm(motif?: string): void {
    if (!this.selectedEntreprise || !this.pendingAction) return;
    this.dialogOpen = false;

    if (this.pendingAction === 'supprimer') {
      this.entrepriseService.supprimerEntreprise(this.selectedEntreprise.id).subscribe({
        next: () => this.recharger(),
        error: err => console.error(err),
      });
      return;
    }

    const request: DecisionEntrepriseRequest = {
      valider:    this.pendingAction === 'valider',
      motifRefus: motif,
    };

    this.entrepriseService
      .prendreDecision(
        this.selectedEntreprise.id,
        request,
        this.selectedEntreprise.statutCompte === 'EN_ATTENTE'
      )
      .subscribe({
        next: () => this.recharger(),
        error: err => console.error(err),
      });
  }

  private recharger(): void {
    const statut = this.sharedState.filtres().statut;
    this.chargerEntreprises(this.currentPage, statut === 'TOUS' ? undefined : statut);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }
}