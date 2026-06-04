import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'shared-lib';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  email = '';
  password = '';
  error = '';
  validationMsg = '';
  showPassword = false;
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  validateEmail(val: string): string {
    if (!val) return '';
    if (!val.includes('@')) return `Please include an '@' in the email address. '${val}' is missing an '@'.`;
    const parts = val.split('@');
    if (parts[1] === '' || !parts[1]) return `Please enter a part following '@'. '${val}' is incomplete.`;
    return '';
  }

  handleEmailChange(val: string): void {
    this.email = val;
    this.error = '';
    this.validationMsg = this.validateEmail(val);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  handleSubmit(e: Event): void {
    e.preventDefault();
    const emailErr = this.validateEmail(this.email);
    if (emailErr) {
      this.validationMsg = emailErr;
      return;
    }
    this.validationMsg = '';
    this.error = '';
    this.isSubmitting = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res && res.accessToken) {
          this.router.navigate(['/admin/lost-items']);
        } else {
          this.error = 'Invalid credentials. Please try again.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.message || 'Invalid admin credentials. Please try again.';
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/']);
  }
}
