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

/**
 * Composant de liste paginée des comptes entreprises.
 *
 * Affiche l'ensemble des entreprises enregistrées avec filtrage par statut,
 * recherche textuelle en temps réel et pagination côté serveur.
 * Permet au Super Admin de valider, refuser ou supprimer un compte
 * via des boîtes de dialogue de confirmation.
 *
 * @author Riahi Dorsaf
 */
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

  // ── Services injectés ─────────────────────────────────────

  private readonly entrepriseService = inject(EntrepriseService);

  /** Service partagé exposant les filtres actifs et le compteur d'entreprises en attente. */
  readonly sharedState               = inject(SharedStateService);

  // ── État local — liste et pagination ──────────────────────

  /** Liste courante des entreprises retournées par l'API pour la page active. */
  readonly entreprises = signal<EntrepriseCompteResponse[]>([]);

  /** Indicateur de chargement affiché pendant les appels HTTP. */
  isLoading     = false;

  /** Index de la page courante (base 0). */
  currentPage   = 0;

  /** Nombre total de pages disponibles côté serveur. */
  totalPages    = 0;

  /** Nombre total d'entreprises correspondant aux filtres actifs. */
  totalElements = 0;

  /** Nombre d'éléments par page — fixe pour toute la vue. */
  readonly pageSize = 10;

  /** Compteur réactif des entreprises dont le statut est EN_ATTENTE. */
  readonly nbEnAttente = this.sharedState.nbEntreprisesEnAttente;

  // ── Filtrage textuel local ─────────────────────────────────

  /**
   * Sous-ensemble filtré par la saisie textuelle de l'utilisateur.
   * Aucun appel HTTP supplémentaire : le filtre s'applique sur la page courante.
   */
  readonly entreprisesFiltered = computed(() => {
    const recherche = this.sharedState.filtres().recherche.toLowerCase().trim();
    if (!recherche) return this.entreprises();
    return this.entreprises().filter(e =>
      e.nomEntreprise.toLowerCase().includes(recherche) ||
      e.matriculeFiscale.toLowerCase().includes(recherche) ||
      `${e.proprietairePrenom} ${e.proprietaireNom}`.toLowerCase().includes(recherche)
    );
  });

  // ── État de la boîte de dialogue ──────────────────────────

  /** Contrôle la visibilité de la boîte de dialogue de confirmation. */
  dialogOpen                           = false;

  /** Configuration dynamique transmise au composant ConfirmDialog. */
  dialogConfig!: ConfirmDialogConfig;

  /** Entreprise sélectionnée en attente de confirmation. */
  private selectedEntreprise: EntrepriseCompteResponse | null = null;

  /** Action en attente de confirmation ('valider' | 'refuser' | 'supprimer'). */
  private pendingAction: 'valider' | 'refuser' | 'supprimer' | null = null;

  // ── Options de filtre statut ───────────────────────────────

  /** Liste des options affichées dans le sélecteur de filtre par statut. */
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

  // ── Chargement des données ─────────────────────────────────

  /**
   * Charge une page d'entreprises depuis l'API avec un filtre statut optionnel.
   * @param page   Index de la page à charger (base 0).
   * @param statut Filtre optionnel sur le statut du compte entreprise.
   */
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

  // ── Gestion des filtres ────────────────────────────────────

  /**
   * Met à jour le filtre statut dans le service partagé.
   * L'effect du constructeur déclenche automatiquement le rechargement.
   * @param statut Nouveau statut sélectionné, ou 'TOUS' pour désactiver le filtre.
   */
  onFiltreChange(statut: StatutCompte | 'TOUS'): void {
    this.sharedState.setFiltreStatut(statut);
  }

  /** Réinitialise tous les filtres actifs (statut et recherche textuelle). */
  resetFiltres(): void {
    this.sharedState.resetFiltres();
  }

  // ── Pagination ────────────────────────────────────────────

  /**
   * Navigue vers une page donnée en conservant le filtre statut actif.
   * @param page Index de la page cible (base 0).
   */
  goToPage(page: number): void {
    const statut = this.sharedState.filtres().statut;
    this.chargerEntreprises(page, statut === 'TOUS' ? undefined : statut);
  }

  /**
   * Retourne un tableau d'indices de pages pour générer les boutons de pagination.
   */
  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  // ── Boîtes de dialogue ────────────────────────────────────

  /**
   * Ouvre le dialog de confirmation pour valider (activer) une entreprise.
   * @param e Entreprise à valider.
   */
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

  /**
   * Ouvre le dialog de confirmation pour refuser une entreprise.
   * Exige la saisie d'un motif de refus obligatoire.
   * @param e Entreprise à refuser.
   */
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

  /**
   * Ouvre le dialog de confirmation pour supprimer définitivement une entreprise.
   * @param e Entreprise à supprimer.
   */
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

  /** Ferme le dialog et réinitialise l'état de sélection. */
  closeDialog(): void {
    this.dialogOpen         = false;
    this.selectedEntreprise = null;
    this.pendingAction      = null;
  }

  /**
   * Exécute l'action confirmée par l'utilisateur dans le dialog.
   * Dispatche vers l'API de suppression ou de décision selon l'action en attente.
   * @param motif Motif saisi par l'utilisateur, transmis uniquement pour l'action 'refuser'.
   */
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

  // ── Utilitaires ───────────────────────────────────────────

  /** Recharge la page courante en conservant le filtre statut actif. */
  private recharger(): void {
    const statut = this.sharedState.filtres().statut;
    this.chargerEntreprises(this.currentPage, statut === 'TOUS' ? undefined : statut);
  }

  /**
   * Formate une date ISO en chaîne lisible en français (ex. : « 05 avr. 2025 »).
   * @param iso Chaîne de date au format ISO 8601.
   */
  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }
}
