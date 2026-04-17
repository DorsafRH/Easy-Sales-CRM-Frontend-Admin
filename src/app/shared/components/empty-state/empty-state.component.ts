import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant d'état vide générique.
 *
 * Affiché à la place d'une liste ou d'un tableau lorsqu'aucun résultat
 * ne correspond aux critères actifs. Supporte un bouton d'action optionnel
 * (ex. : réinitialiser les filtres, créer un élément) dont le libellé
 * et le comportement sont entièrement configurables par le composant parent.
 *
 * @author Riahi Dorsaf
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {

  // ── Entrées ───────────────────────────────────────────────

  /** Titre principal affiché en gras dans l'état vide. */
  @Input() title       = 'Aucun résultat';

  /** Message secondaire décrivant la situation ou suggérant une action. */
  @Input() message     = 'Il n\'y a rien à afficher pour le moment.';

  /** Libellé du bouton d'action optionnel. Masqué si la chaîne est vide. */
  @Input() actionLabel = '';

  // ── Sorties ───────────────────────────────────────────────

  /** Émet sans valeur lorsque l'utilisateur clique sur le bouton d'action. */
  @Output() action     = new EventEmitter<void>();
}
