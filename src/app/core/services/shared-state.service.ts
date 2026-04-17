import { Injectable, signal, computed } from '@angular/core';
import { AuthResponse } from '../models/auth.model';
import { FiltresEntreprise, StatutCompte } from '../models/entreprise.model';

/**
 * Service d'état partagé entre plusieurs composants — Easy Sales CRM.
 *
 * Utilise les Signals Angular pour la réactivité.
 * Centralise les états globaux synchronisés entre composants
 * non liés par une relation parent/enfant.
 *
 * Signals exposés :
 * - currentUser            → sidebar, header, authGuard
 * - nbEntreprisesEnAttente → liste entreprises (filtre actif)
 * - nbNotificationsNonLues → badge sidebar notifications
 * - filtres                → filtres liste entreprises
 *
 * @author Riahi Dorsaf
 */
@Injectable({ providedIn: 'root' })
export class SharedStateService {

  // ── Utilisateur connecté ──────────────────────────────────

  /** Utilisateur actuellement connecté — null si déconnecté. */
  readonly currentUser = signal<AuthResponse | null>(null);

  /** True si un utilisateur est connecté. */
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  /** Nom complet de l'utilisateur connecté (prénom + nom). */
  readonly nomComplet = computed(() => {
    const user = this.currentUser();
    return user ? `${user.prenom} ${user.nom}` : '';
  });

  // ── Compteurs ─────────────────────────────────────────────

  /** Nombre d'entreprises en attente de validation. */
  readonly nbEntreprisesEnAttente = signal<number>(0);

  /** Nombre de notifications non lues — alimente le badge sidebar. */
  readonly nbNotificationsNonLues = signal<number>(0);

  // ── Filtres liste entreprises ─────────────────────────────

  /** Filtres actifs sur la liste des entreprises. */
  readonly filtres = signal<FiltresEntreprise>({
    statut:    'TOUS',
    recherche: '',
  });

  // ── Mutations utilisateur ─────────────────────────────────

  /** Définit l'utilisateur connecté après authentification. */
  setCurrentUser(user: AuthResponse): void {
    this.currentUser.set(user);
  }

  /** Efface l'utilisateur connecté lors de la déconnexion. */
  clearCurrentUser(): void {
    this.currentUser.set(null);
  }

  // ── Mutations entreprises ─────────────────────────────────

  /** Met à jour le compteur d'entreprises en attente. */
  setNbEnAttente(nb: number): void {
    this.nbEntreprisesEnAttente.set(nb);
  }

  /** Décrémente le compteur d'entreprises en attente après une décision. */
  decrementeNbEnAttente(): void {
    const current = this.nbEntreprisesEnAttente();
    if (current > 0) this.nbEntreprisesEnAttente.set(current - 1);
  }

  // ── Mutations notifications ───────────────────────────────

  /** Met à jour le badge de notifications non lues. */
  setNbNotificationsNonLues(nb: number): void {
    this.nbNotificationsNonLues.set(nb);
  }

  /** Décrémente le badge après lecture d'une notification. */
  decrementeNbNotifications(): void {
    const current = this.nbNotificationsNonLues();
    if (current > 0) this.nbNotificationsNonLues.set(current - 1);
  }

  /** Remet le badge à zéro après "tout marquer comme lu". */
  resetNbNotifications(): void {
    this.nbNotificationsNonLues.set(0);
  }

  // ── Mutations filtres ─────────────────────────────────────

  /** Met à jour le filtre par statut de la liste entreprises. */
  setFiltreStatut(statut: StatutCompte | 'TOUS'): void {
    this.filtres.update(f => ({ ...f, statut }));
  }

  /** Met à jour le filtre de recherche textuelle. */
  setFiltreRecherche(recherche: string): void {
    this.filtres.update(f => ({ ...f, recherche }));
  }

  /** Réinitialise tous les filtres à leur valeur par défaut. */
  resetFiltres(): void {
    this.filtres.set({ statut: 'TOUS', recherche: '' });
  }
}