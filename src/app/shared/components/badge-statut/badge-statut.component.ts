import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatutCompte } from '../../../core/models/entreprise.model';

/**
 * Composant d'affichage du badge de statut d'un compte entreprise.
 *
 * Rend un badge coloré et localisé en français correspondant au statut
 * métier du compte (EN_ATTENTE, ACTIVE, REFUSE, SUSPENDU).
 * Utilisable dans toute vue affichant des informations d'entreprise.
 *
 * @author Riahi Dorsaf
 */
@Component({
  selector: 'app-badge-statut',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-statut.component.html',
  styleUrl: './badge-statut.component.scss',
})
export class BadgeStatutComponent {

  // ── Entrées ───────────────────────────────────────────────

  /** Statut du compte entreprise à afficher — propriété obligatoire. */
  @Input({ required: true }) statut!: StatutCompte;

  // ── Propriétés calculées ──────────────────────────────────

  /**
   * Retourne la classe CSS BEM correspondant au statut pour appliquer la couleur du badge.
   * Retourne 'badge--en-attente' comme valeur de repli pour tout statut inconnu.
   */
  get badgeClass(): string {
    const map: Record<StatutCompte, string> = {
      EN_ATTENTE: 'badge--en-attente',
      ACTIVE:     'badge--active',
      REFUSE:     'badge--refuse',
      SUSPENDU:   'badge--suspendu',
    };
    return map[this.statut] ?? 'badge--en-attente';
  }

  /**
   * Retourne le libellé français affiché dans le badge.
   * Retourne la valeur brute du statut comme repli si la clé est inconnue.
   */
  get label(): string {
    const map: Record<StatutCompte, string> = {
      EN_ATTENTE: 'En attente',
      ACTIVE:     'Actif',
      REFUSE:     'Refusé',
      SUSPENDU:   'Suspendu',
    };
    return map[this.statut] ?? this.statut;
  }
}
