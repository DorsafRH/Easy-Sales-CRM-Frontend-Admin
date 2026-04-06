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
  /** Injecté depuis le paramètre de route via withComponentInputBinding() */
  @Input() id!: string;

  private readonly entrepriseService = inject(EntrepriseService);
  private readonly router            = inject(Router);

  entreprise: EntrepriseCompteResponse | null = null;
  isLoading  = false;
  dialogOpen = false;
  dialogConfig!: ConfirmDialogConfig;
  private pendingAction: 'valider' | 'refuser' | 'supprimer' | null = null;

  ngOnInit(): void {
    this.chargerEntreprise();
  }

  get tailleLabel(): string {
    const labels: Record<string, string> = {
      TPE: 'Très petite entreprise',
      PME: 'Petite et moyenne entreprise',
      GE:  'Grande entreprise',
    };
    return this.entreprise ? labels[this.entreprise.tailleEntreprise] ?? '' : '';
  }

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

  closeDialog(): void {
    this.dialogOpen    = false;
    this.pendingAction = null;
  }

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

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }
}