import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SharedStateService } from '../../core/services/shared-state.service';
import { AuthService } from '../../core/services/auth.service';

/**
 * Sidebar de navigation principale — Easy Sales CRM.
 *
 * Affiche les liens de navigation et le badge de notifications
 * non lues mis à jour en temps quasi-réel via polling.
 *
 * @author Riahi Dorsaf
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {

  private readonly sharedState = inject(SharedStateService);
  private readonly authService = inject(AuthService);

  /** Nombre de notifications non lues — alimente le badge sidebar. */
  readonly nbNotifications = this.sharedState.nbNotificationsNonLues;

  /** Nom complet de l'utilisateur connecté affiché en bas de sidebar. */
  readonly nomComplet = this.sharedState.nomComplet;

  /**
   * Retourne les initiales de l'utilisateur connecté pour l'avatar.
   * Exemple : "Dorsaf Riahi" → "DR"
   */
  readonly initiales = () => {
    const user = this.sharedState.currentUser();
    if (!user) return 'A';
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
  };

  /** Déconnecte l'utilisateur et redirige vers la page login. */
  logout(): void {
    this.authService.logout();
  }
}