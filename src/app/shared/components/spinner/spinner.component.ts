import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant d'indicateur de chargement réutilisable.
 *
 * Affiche une animation de spinner configurable en taille et en mode.
 * Peut s'intégrer en ligne dans un conteneur ou en mode overlay plein écran
 * pour bloquer visuellement l'interface pendant une opération asynchrone.
 *
 * @author Riahi Dorsaf
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {

  // ── Entrées ───────────────────────────────────────────────

  /** Taille du spinner : 'sm' pour petit, 'md' pour moyen (par défaut). */
  @Input() size: 'sm' | 'md' = 'md';

  /** Texte d'accessibilité affiché sous le spinner (vide par défaut). */
  @Input() label = '';

  /** Active le mode overlay plein écran superposé au contenu de la page. */
  @Input() overlay = false;
}
