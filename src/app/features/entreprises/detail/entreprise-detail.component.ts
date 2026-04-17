import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { EntrepriseService } from '../../../core/services/entreprise.service';
import {
  EntrepriseCompteResponse,
  DecisionEntrepriseRequest,
} from '../../../core/models/entreprise.model';
import { BadgeStatutComponent } from '../../../shared/components/badge-statut/badge-statut.component';
import { ConfirmDialogComponent, ConfirmDialogConfig } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

/**
 * Composant de page détail d'un compte entreprise.
 *
 * Affiche l'ensemble des informations d'une entreprise identifiée par son id
 * de route et permet au Super Admin de prendre une décision (validation,
 * refus, suppression) via des boîtes de dialogue de confirmation.
 * En cas d'erreur de chargement, l'utilisateur est redirigé vers la liste.
 *
 * @author Riahi Dorsaf
 */
@Component({
  selector: 'app-entreprise-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    BadgeStatutComponent, ConfirmDialogComponent, SpinnerComponent,
  ],
  templateUrl: './entreprise-detail.component.html',
  styleUrl: './entreprise-detail.component.scss',
})
export class EntrepriseDetailComponent implements OnInit {

  // ── Paramètre de route ────────────────────────────────────

  /** Identifiant de l'entreprise injecté depuis le paramètre de route via withComponentInputBinding(). */
  @Input() id!: string;

  // ── Services injectés ─────────────────────────────────────

  private readonly entrepriseService = inject(EntrepriseService);
  private readonly router            = inject(Router);

  // ── État local ────────────────────────────────────────────

  /** Données de l'entreprise courante, null tant que le chargement n'est pas terminé. */
  entreprise: EntrepriseCompteResponse | null = null;

  /** Indicateur de chargement affiché pendant l'appel HTTP initial. */
  isLoading  = false;

  /** Contrôle la visibilité de la boîte de dialogue de confirmation. */
  dialogOpen = false;

  /** Configuration dynamique transmise au composant ConfirmDialog. */
  dialogConfig!: ConfirmDialogConfig;

  /** Action en attente de confirmation ('valider' | 'refuser' | 'supprimer'). */
  private pendingAction: 'valider' | 'refuser' | 'supprimer' | null = null;

  // ── Cycle de vie ──────────────────────────────────────────

  ngOnInit(): void {
    this.chargerEntreprise();
  }

  // ── Propriétés calculées ──────────────────────────────────

  /**
   * Retourne le libellé complet de la taille de l'entreprise à partir du code métier.
   * Retourne une chaîne vide si l'entreprise n'est pas encore chargée.
   */
  get tailleLabel(): string {
    const labels: Record<string, string> = {
      TPE: 'Très petite entreprise',
      PME: 'Petite et moyenne entreprise',
      GE:  'Grande entreprise',
    };
    return this.entreprise ? labels[this.entreprise.tailleEntreprise] ?? '' : '';
  }

  // ── Chargement des données ─────────────────────────────────

  /**
   * Charge les détails de l'entreprise depuis l'API à partir de l'id de route.
   * Redirige vers la liste en cas d'erreur (ex. : id inexistant ou accès refusé).
   */
  private chargerEntreprise(): void {
    this.isLoading = true;
    this.entrepriseService.getEntrepriseById(+this.id).subscribe({
      next: response => {
        this.isLoading = false;
        if (response.success) this.entreprise = response.data;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/entreprises']);
      },
    });
  }

  // ── Boîtes de dialogue ────────────────────────────────────

  /** Ouvre le dialog de confirmation pour valider (activer) l'entreprise courante. */
  ouvrirDialogValider(): void {
    this.pendingAction = 'valider';
    this.dialogConfig  = {
      title:          'Valider cette entreprise',
      message:        `Activer le compte de "${this.entreprise?.nomEntreprise}" ?`,
      confirmLabel:   'Valider',
      confirmVariant: 'success',
    };
    this.dialogOpen = true;
  }

  /**
   * Ouvre le dialog de confirmation pour refuser l'entreprise courante.
   * Exige la saisie d'un motif de refus obligatoire.
   */
  ouvrirDialogRefuser(): void {
    this.pendingAction = 'refuser';
    this.dialogConfig  = {
      title:          'Refuser cette demande',
      message:        `Refuser le compte de "${this.entreprise?.nomEntreprise}" ?`,
      confirmLabel:   'Refuser',
      confirmVariant: 'danger',
      showMotif:      true,
      motifRequired:  true,
    };
    this.dialogOpen = true;
  }

  /** Ouvre le dialog de confirmation pour supprimer définitivement l'entreprise courante. */
  ouvrirDialogSupprimer(): void {
    this.pendingAction = 'supprimer';
    this.dialogConfig  = {
      title:          'Supprimer définitivement',
      message:        `Action irréversible. Supprimer "${this.entreprise?.nomEntreprise}" ?`,
      confirmLabel:   'Supprimer',
      confirmVariant: 'danger',
    };
    this.dialogOpen = true;
  }

  /** Ferme le dialog et réinitialise l'action en attente. */
  closeDialog(): void {
    this.dialogOpen    = false;
    this.pendingAction = null;
  }

  /**
   * Exécute l'action confirmée par l'utilisateur dans le dialog.
   * Pour une suppression, redirige vers la liste après succès.
   * Pour une décision (validation/refus), met à jour l'état local de l'entreprise.
   * @param motif Motif saisi par l'utilisateur, transmis uniquement pour l'action 'refuser'.
   */
  onDialogConfirm(motif?: string): void {
    if (!this.entreprise || !this.pendingAction) return;
    this.dialogOpen = false;

    if (this.pendingAction === 'supprimer') {
      this.entrepriseService.supprimerEntreprise(this.entreprise.id).subscribe({
        next: () => this.router.navigate(['/admin/entreprises']),
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
        this.entreprise.id,
        request,
        this.entreprise.statutCompte === 'EN_ATTENTE'
      )
      .subscribe({
        next: response => {
          if (response.success) this.entreprise = response.data;
        },
        error: err => console.error(err),
      });
  }

  // ── Utilitaires ───────────────────────────────────────────

  /**
   * Formate une date ISO en chaîne lisible en français (ex. : « 05 avril 2025 »).
   * @param iso Chaîne de date au format ISO 8601.
   */
  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }
}
