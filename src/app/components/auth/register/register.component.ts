import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
//import * as QRCode from 'qrcode';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Create Account</h2>
          <p>Join Finance App today</p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <!-- Role Selection -->
          <div class="form-group">
            <label class="form-label">I am a</label>
            <select formControlName="role" class="form-select" (change)="onRoleChange()">
              <option value="">Select your role</option>
              <option value="owner">Amount Giver (Owner)</option>
              <option value="borrower">Amount Receiver (Borrower)</option>
            </select>
            <div class="field-error" *ngIf="registerForm.get('role')?.invalid && registerForm.get('role')?.touched">
              Please select your role
            </div>
          </div>

          <!-- Common Fields -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input
                type="text"
                formControlName="name"
                class="form-input"
                placeholder="Enter your full name"
                [class.error]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
              >
              <div class="field-error" *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
                Name is required
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input
                type="email"
                formControlName="email"
                class="form-input"
                placeholder="Enter your email"
                [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              >
              <div class="field-error" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mobile Number</label>
              <input
                type="tel"
                formControlName="mobile"
                class="form-input"
                placeholder="Enter your mobile number"
                [class.error]="registerForm.get('mobile')?.invalid && registerForm.get('mobile')?.touched"
              >
              <div class="field-error" *ngIf="registerForm.get('mobile')?.invalid && registerForm.get('mobile')?.touched">
                Mobile number is required
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">GPay Mobile Number</label>
              <input
                type="tel"
                formControlName="gpayAccess"
                class="form-input"
                placeholder="GPay linked mobile number"
                [class.error]="registerForm.get('gpayAccess')?.invalid && registerForm.get('gpayAccess')?.touched"
              >
              <div class="field-error" *ngIf="registerForm.get('gpayAccess')?.invalid && registerForm.get('gpayAccess')?.touched">
                GPay mobile number is required
              </div>
            </div>
          </div>

          <!-- Owner Specific Fields -->
          <div *ngIf="registerForm.get('role')?.value === 'owner'">
            <div class="form-group">
              <label class="form-label">QR Code for Payments</label>
              <input
                type="file"
                (change)="onQRCodeSelect($event)"
                accept="image/*"
                class="form-input file-input"
              >
              <div class="qr-preview" *ngIf="qrCodePreview">
                <img [src]="qrCodePreview" alt="QR Code Preview" class="qr-image">
              </div>
              <div class="field-error" *ngIf="!registerForm.get('qrCode')?.value && registerForm.get('role')?.value === 'owner' && registerForm.get('qrCode')?.touched">
                QR Code is required for owners
              </div>
            </div>
          </div>

          <!-- Borrower Specific Fields -->
          <div *ngIf="registerForm.get('role')?.value === 'borrower'">
            <div class="form-group">
              <label class="form-label">Address</label>
              <textarea
                formControlName="address"
                class="form-input"
                rows="3"
                placeholder="Enter your complete address"
                [class.error]="registerForm.get('address')?.invalid && registerForm.get('address')?.touched"
              ></textarea>
              <div class="field-error" *ngIf="registerForm.get('address')?.invalid && registerForm.get('address')?.touched">
                Address is required
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Bank Name</label>
                <input
                  type="text"
                  formControlName="bankName"
                  class="form-input"
                  placeholder="Your bank name"
                  [class.error]="registerForm.get('bankName')?.invalid && registerForm.get('bankName')?.touched"
                >
                <div class="field-error" *ngIf="registerForm.get('bankName')?.invalid && registerForm.get('bankName')?.touched">
                  Bank name is required
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Account Holder Name</label>
                <input
                  type="text"
                  formControlName="accountHolderName"
                  class="form-input"
                  placeholder="Account holder name"
                  [class.error]="registerForm.get('accountHolderName')?.invalid && registerForm.get('accountHolderName')?.touched"
                >
                <div class="field-error" *ngIf="registerForm.get('accountHolderName')?.invalid && registerForm.get('accountHolderName')?.touched">
                  Account holder name is required
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Your Photo</label>
              <input
                type="file"
                (change)="onPhotoSelect($event)"
                accept="image/*"
                class="form-input file-input"
              >
              <div class="photo-preview" *ngIf="photoPreview">
                <img [src]="photoPreview" alt="Photo Preview" class="photo-image">
              </div>
              <div class="field-error" *ngIf="!registerForm.get('photo')?.value && registerForm.get('role')?.value === 'borrower' && registerForm.get('photo')?.touched">
                Photo is required for borrowers
              </div>
            </div>
          </div>

          <!-- Password Fields -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Password</label>
              <input
                type="password"
                formControlName="password"
                class="form-input"
                placeholder="Create a password"
                [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              >
              <div class="field-error" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input
                type="password"
                formControlName="confirmPassword"
                class="form-input"
                placeholder="Confirm your password"
                [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              >
              <div class="field-error" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
                <span *ngIf="registerForm.get('confirmPassword')?.errors?.['mismatch']">Passwords do not match</span>
              </div>
            </div>
          </div>

          <div class="alert alert-error" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="registerForm.invalid || loading">
            <span *ngIf="loading" class="loading-spinner"></span>
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 40px;
      width: 100%;
      max-width: 600px;
      animation: slideUp 0.5s ease-out;
      max-height: 90vh;
      overflow-y: auto;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-header h2 {
      color: #1a202c;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .auth-header p {
      color: #718096;
      font-size: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }

    .form-input, .form-select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s ease;
      background-color: #f9fafb;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input.error, .form-select.error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .file-input {
      padding: 8px 12px;
      cursor: pointer;
    }

    .qr-preview, .photo-preview {
      margin-top: 12px;
      text-align: center;
    }

    .qr-image, .photo-image {
      max-width: 150px;
      max-height: 150px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
    }

    .field-error {
      margin-top: 6px;
      font-size: 12px;
      color: #ef4444;
    }

    .btn-full {
      width: 100%;
      padding: 14px;
      font-size: 16px;
      font-weight: 600;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .auth-footer p {
      color: #6b7280;
      margin: 0;
    }

    .auth-footer a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .auth-card {
        padding: 24px;
        max-width: 100%;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .auth-header h2 {
        font-size: 24px;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  qrCodePreview = '';
  photoPreview = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required]],
      gpayAccess: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]],
      // Owner specific
      qrCode: [''],
      // Borrower specific
      address: [''],
      bankName: [''],
      accountHolderName: [''],
      photo: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else if (confirmPassword?.errors?.['mismatch']) {
      delete confirmPassword.errors['mismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  onRoleChange() {
    const role = this.registerForm.get('role')?.value;
    
    // Reset role-specific fields
    this.registerForm.patchValue({
      qrCode: '',
      address: '',
      bankName: '',
      accountHolderName: '',
      photo: ''
    });
    
    this.qrCodePreview = '';
    this.photoPreview = '';
    
    // Update validators based on role
    if (role === 'owner') {
      this.registerForm.get('qrCode')?.setValidators([Validators.required]);
      this.registerForm.get('address')?.clearValidators();
      this.registerForm.get('bankName')?.clearValidators();
      this.registerForm.get('accountHolderName')?.clearValidators();
      this.registerForm.get('photo')?.clearValidators();
    } else if (role === 'borrower') {
      this.registerForm.get('address')?.setValidators([Validators.required]);
      this.registerForm.get('bankName')?.setValidators([Validators.required]);
      this.registerForm.get('accountHolderName')?.setValidators([Validators.required]);
      this.registerForm.get('photo')?.setValidators([Validators.required]);
      this.registerForm.get('qrCode')?.clearValidators();
    }
    
    // Update validation
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.updateValueAndValidity();
    });
  }

  onQRCodeSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.qrCodePreview = e.target?.result as string;
        this.registerForm.patchValue({ qrCode: this.qrCodePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
        this.registerForm.patchValue({ photo: this.photoPreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Registration successful! Redirecting to login...';
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}