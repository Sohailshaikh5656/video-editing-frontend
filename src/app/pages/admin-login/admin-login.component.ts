import { Component, signal, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/sharedModule';
import { AdminAuthService } from '../../services/admin/admin-auth.service';

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
  private adminAuthService = inject(AdminAuthService);

  showPassword = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);
  isDark = signal<boolean>(this.getInitialTheme());

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
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

    const { username, password } = this.form.value;

    this.adminAuthService.login(username, password).subscribe({
      next: (res: any) => {
        let data = res.data ?? res;
        let token = data?.token;
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', JSON.stringify(token));
        this.loading.set(false);
        this.router.navigateByUrl('/admin/dashboard');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(
          typeof err?.error?.message === 'string'
            ? err.error.message
            : 'Invalid username or password.',
        );
      },
    });
  }
}
