import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { NotificationService } from '../../core/services/notification.service';

/**
 * Layout principal de l'application — Easy Sales CRM.
 *
 * Orchestre la sidebar, le header et le contenu principal.
 * Démarre le polling des notifications au chargement
 * et l'arrête proprement à la destruction du composant.
 *
 * @author Riahi Dorsaf
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  private readonly router              = inject(Router);
  private readonly notificationService = inject(NotificationService);

  /** Titre affiché dans le header — mis à jour à chaque changement de route. */
  pageTitle = 'Dashboard';

  /**
   * Correspondance route → titre du header.
   * Les routes non listées affichent "Dashboard" par défaut.
   */
  private readonly pageTitles: Record<string, string> = {
    '/admin/dashboard':     'Dashboard',
    '/admin/entreprises':   'Gestion des entreprises',
    '/admin/notifications': 'Notifications',
  };

  ngOnInit(): void {
    // Démarrer le polling des notifications (toutes les 30 secondes)
    this.notificationService.startPolling();

    // Mettre à jour le titre du header à chaque navigation
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        map((e: NavigationEnd) => {
          const url = e.urlAfterRedirects.split('?')[0];
          if (/\/admin\/entreprises\/\d+/.test(url)) return 'Détail entreprise';
          return this.pageTitles[url] ?? 'Dashboard';
        })
      )
      .subscribe(title => (this.pageTitle = title));

    // Définir le titre initial sans attendre un événement de navigation
    const url = this.router.url.split('?')[0];
    if (/\/admin\/entreprises\/\d+/.test(url)) {
      this.pageTitle = 'Détail entreprise';
    } else {
      this.pageTitle = this.pageTitles[url] ?? 'Dashboard';
    }
  }

  ngOnDestroy(): void {
    // Arrêter le polling pour éviter les fuites mémoire
    this.notificationService.stopPolling();
  }
}