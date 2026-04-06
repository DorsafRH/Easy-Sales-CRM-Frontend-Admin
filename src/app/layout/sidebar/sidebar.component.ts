import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SharedStateService } from '../../core/services/shared-state.service';
import { AuthService } from '../../core/services/auth.service';

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

  readonly nbEnAttente = this.sharedState.nbEntreprisesEnAttente;
  readonly nomComplet  = this.sharedState.nomComplet;

  readonly initiales = () => {
    const user = this.sharedState.currentUser();
    if (!user) return 'A';
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
  };

  logout(): void {
    this.authService.logout();
  }
}