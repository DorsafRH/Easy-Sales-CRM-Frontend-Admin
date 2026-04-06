import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { EntrepriseService } from '../../core/services/entreprise.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private readonly router            = inject(Router);
  private readonly entrepriseService = inject(EntrepriseService);

  pageTitle = 'Dashboard';

  private readonly pageTitles: Record<string, string> = {
    '/admin/entreprises': 'Gestion des entreprises',
  };

  ngOnInit(): void {
    // Charge le compteur EN_ATTENTE pour le badge sidebar
    this.entrepriseService.getEntreprisesEnAttente().subscribe();

    // Met à jour le titre selon la route active
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

    // Titre initial
    const url = this.router.url.split('?')[0];
    if (/\/admin\/entreprises\/\d+/.test(url)) {
      this.pageTitle = 'Détail entreprise';
    } else {
      this.pageTitle = this.pageTitles[url] ?? 'Dashboard';
    }
  }
}