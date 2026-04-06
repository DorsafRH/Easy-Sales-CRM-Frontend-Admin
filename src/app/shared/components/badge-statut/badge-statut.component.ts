import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatutCompte } from '../../../core/models/entreprise.model';

@Component({
  selector: 'app-badge-statut',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-statut.component.html',
  styleUrl: './badge-statut.component.scss',
})
export class BadgeStatutComponent {
  @Input({ required: true }) statut!: StatutCompte;

  get badgeClass(): string {
    const map: Record<StatutCompte, string> = {
      EN_ATTENTE: 'badge--en-attente',
      ACTIVE:     'badge--active',
      REFUSE:     'badge--refuse',
      SUSPENDU:   'badge--suspendu',
    };
    return map[this.statut] ?? 'badge--en-attente';
  }

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