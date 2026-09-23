import { Component, signal, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/sharedModule';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  showPassword = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);
  isDark = signal<boolean>(this.getInitialTheme());

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  private getInitialTheme(): boolean {
    return document.documentElement.getAttribute('data-bs-theme') !== 'light';
  }

  toggleTheme(): void {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('cr-theme', next);
    this.isDark.set(next === 'dark');
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.errorMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    // TODO: replace with real auth call
    setTimeout(() => {
      this.loading.set(false);
      const { email, password } = this.form.value;

      if (email === 'admin@cutroom.com' && password === 'admin123') {
        localStorage.setItem('token', 'demo-token');
        this.router.navigateByUrl('/admin/home');
      } else {
        this.errorMsg.set('Invalid email or password.');
      }
    }, 900);
  }
}
