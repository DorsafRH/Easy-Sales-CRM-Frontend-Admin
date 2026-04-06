import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ConfirmDialogConfig {
  title:          string;
  message:        string;
  confirmLabel:   string;
  confirmVariant: 'danger' | 'success' | 'primary';
  showMotif?:     boolean;
  motifRequired?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent implements OnChanges {
  @Input()  isOpen = false;
  @Input()  config!: ConfirmDialogConfig;
  @Output() confirmed = new EventEmitter<string | undefined>();
  @Output() cancelled = new EventEmitter<void>();

  motif      = '';
  motifError = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.motif      = '';
      this.motifError = false;
    }
  }

  confirm(): void {
    if (this.config.showMotif && this.config.motifRequired && !this.motif.trim()) {
      this.motifError = true;
      return;
    }
    this.confirmed.emit(this.config.showMotif ? this.motif : undefined);
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.cancel();
    }
  }
}