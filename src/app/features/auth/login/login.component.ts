import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  isLoading    = false;
  errorMessage = '';
  showPassword = false;

  readonly features = [
    'Gestion des comptes entreprises',
    'Validation et modération des demandes',
    'Suivi des activités en temps réel',
    'Tableau de bord centralisé',
  ];

  readonly loginForm = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    const { email, motDePasse } = this.loginForm.value;

    this.authService.login({ email: email!, motDePasse: motDePasse! }).subscribe({
      next: response => {
        this.isLoading = false;
        if (response.data.role !== 'ROLE_SUPER_ADMIN') {
          this.errorMessage = 'Accès refusé. Ce portail est réservé aux Super Admins.';
          return;
        }
        this.router.navigate(['/admin/entreprises']);
      },
      error: err => {
        this.isLoading    = false;
        this.errorMessage = err.error?.message ?? 'Email ou mot de passe incorrect.';
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  getFieldError(field: string): string {
    const control = this.loginForm.get(field);
    if (!control?.errors) return '';
    if (control.errors['required'])  return 'Ce champ est obligatoire.';
    if (control.errors['email'])     return 'Format d\'email invalide.';
    if (control.errors['minlength']) return 'Minimum 6 caractères.';
    return 'Valeur invalide.';
  }
}