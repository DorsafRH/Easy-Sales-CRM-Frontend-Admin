import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Configuration d'une boîte de dialogue de confirmation.
 *
 * Passée en @Input au composant ConfirmDialogComponent pour paramétrer
 * dynamiquement le titre, le message, le libellé du bouton de confirmation
 * ainsi que la variante visuelle et l'option de saisie d'un motif.
 */
export interface ConfirmDialogConfig {
  /** Titre affiché dans l'en-tête de la boîte de dialogue. */
  title:          string;
  /** Corps du message décrivant l'action à confirmer. */
  message:        string;
  /** Libellé du bouton de confirmation. */
  confirmLabel:   string;
  /** Variante visuelle appliquée au bouton de confirmation. */
  confirmVariant: 'danger' | 'success' | 'primary';
  /** Affiche un champ de saisie de motif lorsque true. */
  showMotif?:     boolean;
  /** Rend la saisie du motif obligatoire avant la confirmation lorsque true. */
  motifRequired?: boolean;
}

/**
 * Composant générique de boîte de dialogue de confirmation.
 *
 * Affiche une fenêtre modale configurable permettant à l'utilisateur
 * de confirmer ou d'annuler une action sensible (validation, refus,
 * suppression). Supporte optionnellement la saisie d'un motif.
 * La fermeture est possible via le bouton Annuler ou un clic sur l'overlay.
 *
 * @author Riahi Dorsaf
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent implements OnChanges {

  // ── Entrées / Sorties ─────────────────────────────────────

  /** Contrôle la visibilité de la boîte de dialogue. */
  @Input()  isOpen = false;

  /** Configuration dynamique du contenu et du comportement du dialog. */
  @Input()  config!: ConfirmDialogConfig;

  /** Émet le motif saisi (ou undefined) lorsque l'utilisateur confirme l'action. */
  @Output() confirmed = new EventEmitter<string | undefined>();

  /** Émet sans valeur lorsque l'utilisateur annule ou ferme le dialog. */
  @Output() cancelled = new EventEmitter<void>();

  // ── État interne ──────────────────────────────────────────

  /** Valeur du motif saisi par l'utilisateur dans le champ optionnel. */
  motif      = '';

  /** Indique si l'erreur de validation du motif doit être affichée. */
  motifError = false;

  // ── Cycle de vie ──────────────────────────────────────────

  /**
   * Réinitialise le champ motif et l'état d'erreur à chaque ouverture du dialog.
   * @param changes Objet des changements Angular détecté sur les @Input.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.motif      = '';
      this.motifError = false;
    }
  }

  // ── Gestionnaires d'actions ───────────────────────────────

  /**
   * Valide la saisie du motif si requis, puis émet l'événement confirmed.
   * Bloque la confirmation et affiche une erreur si le motif est obligatoire mais vide.
   */
  confirm(): void {
    if (this.config.showMotif && this.config.motifRequired && !this.motif.trim()) {
      this.motifError = true;
      return;
    }
    this.confirmed.emit(this.config.showMotif ? this.motif : undefined);
  }

  /** Émet l'événement cancelled pour signaler l'annulation au composant parent. */
  cancel(): void {
    this.cancelled.emit();
  }

  /**
   * Ferme le dialog lorsque l'utilisateur clique directement sur l'overlay.
   * Un clic sur le panneau intérieur est ignoré grâce à la vérification de classe.
   * @param event Événement de clic natif sur l'overlay.
   */
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.cancel();
    }
  }
}
