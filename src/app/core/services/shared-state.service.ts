import { Injectable, signal, computed } from '@angular/core';
import { AuthResponse } from '../models/auth.model';
import { FiltresEntreprise, StatutCompte } from '../models/entreprise.model';

/**
 * SharedStateService
 *
 * Signals utilisés uniquement pour l'état partagé entre plusieurs composants :
 * - currentUser  → header, sidebar, authGuard
 * - nbEnAttente  → sidebar (badge) + list (mise à jour après décision)
 * - filtres      → boutons filtre + tableau liste
 */
@Injectable({ providedIn: 'root' })
export class SharedStateService {

  // ── Utilisateur connecté ──────────────────────────────────
  readonly currentUser = signal<AuthResponse | null>(null);
  readonly isLoggedIn  = computed(() => this.currentUser() !== null);
  readonly nomComplet  = computed(() => {
    const user = this.currentUser();
    return user ? `${user.prenom} ${user.nom}` : '';
  });

  // ── Badge sidebar ─────────────────────────────────────────
  readonly nbEntreprisesEnAttente = signal<number>(0);

  // ── Filtres liste ─────────────────────────────────────────
  readonly filtres = signal<FiltresEntreprise>({
    statut:    'TOUS',
    recherche: '',
  });

  // ── Mutations ─────────────────────────────────────────────

  setCurrentUser(user: AuthResponse): void {
    this.currentUser.set(user);
  }

  clearCurrentUser(): void {
    this.currentUser.set(null);
  }

  setNbEnAttente(nb: number): void {
    this.nbEntreprisesEnAttente.set(nb);
  }

  decrementeNbEnAttente(): void {
    const current = this.nbEntreprisesEnAttente();
    if (current > 0) this.nbEntreprisesEnAttente.set(current - 1);
  }

  setFiltreStatut(statut: StatutCompte | 'TOUS'): void {
    this.filtres.update(f => ({ ...f, statut }));
  }

  setFiltreRecherche(recherche: string): void {
    this.filtres.update(f => ({ ...f, recherche }));
  }

  resetFiltres(): void {
    this.filtres.set({ statut: 'TOUS', recherche: '' });
  }
}