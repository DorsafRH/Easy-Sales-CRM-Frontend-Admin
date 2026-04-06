import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input() title       = 'Aucun résultat';
  @Input() message     = 'Il n\'y a rien à afficher pour le moment.';
  @Input() actionLabel = '';
  @Output() action     = new EventEmitter<void>();
}