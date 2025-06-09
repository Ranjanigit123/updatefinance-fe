import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoanService } from '../../../services/loan.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { CreateLoanData } from '../../../models/loan.model';

@Component({
  selector: 'app-create-loan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="create-loan-container">
      <header class="page-header">
        <div class="header-content">
          <button class="btn btn-back" routerLink="/owner-dashboard">
            <i class="material-icons">arrow_back</i>
            Back to Dashboard
          </button>
          <h1>Create New Loan</h1>
        </div>
      </header>

      <div class="content">
        <div class="form-card">
          <div class="form-header">
            <h2>Loan Details</h2>
            <p>Fill in the details to create a new loan agreement</p>
          </div>

          <form [formGroup]="loanForm" (ngSubmit)="onSubmit()" class="loan-form">
            <!-- Borrower Selection -->
            <div class="form-group">
              <label class="form-label">Select Borrower</label>
              <select 
                formControlName="borrowerId" 
                class="form-select"
                [class.error]="loanForm.get('borrowerId')?.invalid && loanForm.get('borrowerId')?.touched"
              >
                <option value="">Choose a borrower</option>
                <option *ngFor="let borrower of borrowers" [value]="borrower._id">
                  {{ borrower.name }} ({{ borrower.email }})
                </option>
              </select>
              <div class="field-error" *ngIf="loanForm.get('borrowerId')?.invalid && loanForm.get('borrowerId')?.touched">
                Please select a borrower
              </div>
              <div class="field-help" *ngIf="borrowers.length === 0 && !loadingBorrowers">
                No borrowers found. Borrowers need to register first.
              </div>
              <div class="field-help" *ngIf="loadingBorrowers">
                Loading borrowers...
              </div>
              <div class="field-help" *ngIf="!loadingBorrowers && borrowers.length > 0">
                Found {{ borrowers.length }} borrower(s)
              </div>
            </div>

            <!-- Selected Borrower Info -->
            <div class="borrower-info" *ngIf="selectedBorrower">
              <h4>Borrower Information</h4>
              <div class="borrower-details">
                <div class="borrower-avatar" *ngIf="selectedBorrower.photo">
                  <img [src]="selectedBorrower.photo" [alt]="selectedBorrower.name">
                </div>
                <div class="borrower-data">
                  <p><strong>Name:</strong> {{ selectedBorrower.name }}</p>
                  <p><strong>Email:</strong> {{ selectedBorrower.email }}</p>
                  <p><strong>Mobile:</strong> {{ selectedBorrower.mobile }}</p>
                  <p><strong>Address:</strong> {{ selectedBorrower.address }}</p>
                  <p><strong>Bank:</strong> {{ selectedBorrower.bankName }}</p>
                  <p><strong>Account Holder:</strong> {{ selectedBorrower.accountHolderName }}</p>
                </div>
              </div>
            </div>

            <!-- Loan Amount -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Principal Amount (₹)</label>
                <input
                  type="number"
                  formControlName="principalAmount"
                  class="form-input"
                  placeholder="Enter loan amount"
                  [class.error]="loanForm.get('principalAmount')?.invalid && loanForm.get('principalAmount')?.touched"
                  (input)="calculateLoanDetails()"
                >
                <div class="field-error" *ngIf="loanForm.get('principalAmount')?.invalid && loanForm.get('principalAmount')?.touched">
                  <span *ngIf="loanForm.get('principalAmount')?.errors?.['required']">Principal amount is required</span>
                  <span *ngIf="loanForm.get('principalAmount')?.errors?.['min']">Amount must be greater than 0</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Interest Rate (%)</label>
                <input
                  type="number"
                  formControlName="interestRate"
                  class="form-input"
                  placeholder="Enter interest rate"
                  step="0.1"
                  [class.error]="loanForm.get('interestRate')?.invalid && loanForm.get('interestRate')?.touched"
                  (input)="calculateLoanDetails()"
                >
                <div class="field-error" *ngIf="loanForm.get('interestRate')?.invalid && loanForm.get('interestRate')?.touched">
                  <span *ngIf="loanForm.get('interestRate')?.errors?.['required']">Interest rate is required</span>
                  <span *ngIf="loanForm.get('interestRate')?.errors?.['min']">Interest rate must be 0 or greater</span>
                  <span *ngIf="loanForm.get('interestRate')?.errors?.['max']">Interest rate cannot exceed 100%</span>
                </div>
              </div>
            </div>

            <!-- Duration -->
            <div class="form-group">
              <label class="form-label">Loan Duration (Months)</label>
              <input
                type="number"
                formControlName="duration"
                class="form-input"
                placeholder="Enter duration in months"
                [class.error]="loanForm.get('duration')?.invalid && loanForm.get('duration')?.touched"
                (input)="calculateLoanDetails()"
              >
              <div class="field-error" *ngIf="loanForm.get('duration')?.invalid && loanForm.get('duration')?.touched">
                <span *ngIf="loanForm.get('duration')?.errors?.['required']">Duration is required</span>
                <span *ngIf="loanForm.get('duration')?.errors?.['min']">Duration must be at least 1 month</span>
              </div>
            </div>

            <!-- Loan Summary -->
            <div class="loan-summary" *ngIf="showSummary">
              <h4>Loan Summary</h4>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Principal Amount:</span>
                  <span class="value">₹{{ calculatedValues.principalAmount | number }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Interest Amount:</span>
                  <span class="value">₹{{ calculatedValues.interestAmount | number }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Total Amount:</span>
                  <span class="value total">₹{{ calculatedValues.totalAmount | number }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Monthly Payment:</span>
                  <span class="value monthly">₹{{ calculatedValues.monthlyAmount | number }}</span>
                </div>
              </div>
            </div>

            <div class="alert alert-error" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="alert alert-success" *ngIf="successMessage">
              {{ successMessage }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" routerLink="/owner-dashboard">
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                [disabled]="loanForm.invalid || submitting || borrowers.length === 0"
              >
                <span *ngIf="submitting" class="loading-spinner"></span>
                {{ submitting ? 'Creating Loan...' : 'Create Loan' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Help Section -->
        <div class="help-card">
          <h3>
            <i class="material-icons">help_outline</i>
            How it works
          </h3>
          <div class="help-content">
            <div class="help-step">
              <div class="step-number">1</div>
              <div class="step-text">
                <h4>Select Borrower</h4>
                <p>Choose from registered borrowers in the system</p>
              </div>
            </div>
            <div class="help-step">
              <div class="step-number">2</div>
              <div class="step-text">
                <h4>Set Loan Terms</h4>
                <p>Enter principal amount, interest rate, and duration</p>
              </div>
            </div>
            <div class="help-step">
              <div class="step-number">3</div>
              <div class="step-text">
                <h4>Review & Create</h4>
                <p>Check the summary and create the loan agreement</p>
              </div>
            </div>
            <div class="help-step">
              <div class="step-number">4</div>
              <div class="step-text">
                <h4>Track Payments</h4>
                <p>Monitor payments and manage the loan from your dashboard</p>
              </div>
            </div>
          </div>

          <!-- Debug Information -->
          <div class="debug-info" *ngIf="!loadingBorrowers">
            <h4>Debug Info:</h4>
            <p>Loading: {{ loadingBorrowers }}</p>
            <p>Borrowers count: {{ borrowers.length }}</p>
            <p>Error: {{ errorMessage || 'None' }}</p>
            <div *ngIf="borrowers.length > 0">
              <p>Borrowers found:</p>
              <ul>
                <li *ngFor="let borrower of borrowers">
                  {{ borrower.name }} ({{ borrower.email }})
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-loan-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .page-header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 20px 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .btn-back {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 12px 20px;
      border-radius: 8px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .btn-back:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .page-header h1 {
      color: white;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    .form-card, .help-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .form-header {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      text-align: center;
    }

    .form-header h2 {
      color: #1a202c;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .form-header p {
      color: #6b7280;
      margin: 0;
    }

    .loan-form {
      padding: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
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
      transition: border-color 0.2s ease;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .form-input.error, .form-select.error {
      border-color: #ef4444;
    }

    .field-error {
      margin-top: 6px;
      font-size: 12px;
      color: #ef4444;
    }

    .field-help {
      margin-top: 6px;
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
    }

    .borrower-info {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .borrower-info h4 {
      color: #1a202c;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
    }

    .borrower-details {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .borrower-avatar {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      flex-shrink: 0;
    }

    .borrower-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .borrower-data p {
      margin: 4px 0;
      font-size: 14px;
      color: #374151;
    }

    .loan-summary {
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .loan-summary h4 {
      color: #0c4a6e;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-item .label {
      color: #374151;
      font-size: 14px;
    }

    .summary-item .value {
      font-weight: 600;
      color: #1a202c;
    }

    .summary-item .value.total {
      color: #0ea5e9;
      font-size: 16px;
    }

    .summary-item .value.monthly {
      color: #10b981;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .btn-secondary {
      background-color: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background-color: #e5e7eb;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .help-card {
      padding: 24px;
      height: fit-content;
    }

    .help-card h3 {
      color: #1a202c;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .help-step {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      align-items: flex-start;
    }

    .step-number {
      width: 28px;
      height: 28px;
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
      flex-shrink: 0;
    }

    .step-text h4 {
      color: #1a202c;
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .step-text p {
      color: #6b7280;
      font-size: 12px;
      margin: 0;
      line-height: 1.4;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .alert-error {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .alert-success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .debug-info {
      margin-top: 20px;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .debug-info h4 {
      color: #374151;
      font-size: 14px;
      margin: 0 0 8px 0;
    }

    .debug-info p {
      color: #6b7280;
      font-size: 12px;
      margin: 4px 0;
    }

    .debug-info ul {
      margin: 8px 0;
      padding-left: 16px;
    }

    .debug-info li {
      color: #6b7280;
      font-size: 12px;
      margin: 2px 0;
    }

    @media (max-width: 768px) {
      .content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .borrower-details {
        flex-direction: column;
        text-align: center;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CreateLoanComponent implements OnInit {
  loanForm: FormGroup;
  borrowers: User[] = [];
  selectedBorrower: User | null = null;
  loadingBorrowers = true;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  showSummary = false;

  calculatedValues = {
    principalAmount: 0,
    interestAmount: 0,
    totalAmount: 0,
    monthlyAmount: 0
  };

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private userService: UserService,
    private router: Router
  ) {
    this.loanForm = this.fb.group({
      borrowerId: ['', [Validators.required]],
      principalAmount: ['', [Validators.required, Validators.min(1)]],
      interestRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      duration: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadBorrowers();
    this.setupFormSubscriptions();
  }

  loadBorrowers() {
    this.loadingBorrowers = true;
    this.errorMessage = '';
    
    console.log('Loading borrowers...');
    
    this.userService.getUsersByRole('borrower').subscribe({
      next: (borrowers) => {
        console.log('Borrowers loaded successfully:', borrowers);
        this.borrowers = borrowers;
        this.loadingBorrowers = false;
      },
      error: (error) => {
        console.error('Error loading borrowers:', error);
        this.errorMessage = 'Failed to load borrowers: ' + (error.error?.message || error.message || 'Unknown error');
        this.loadingBorrowers = false;
      }
    });
  }

  setupFormSubscriptions() {
    // Watch for borrower selection changes
    this.loanForm.get('borrowerId')?.valueChanges.subscribe(borrowerId => {
      this.selectedBorrower = this.borrowers.find(b => b._id === borrowerId) || null;
      console.log('Selected borrower:', this.selectedBorrower);
    });

    // Watch for form value changes to update calculations
    this.loanForm.valueChanges.subscribe(() => {
      this.calculateLoanDetails();
    });
  }

  calculateLoanDetails() {
    const formValue = this.loanForm.value;
    const principal = parseFloat(formValue.principalAmount) || 0;
    const interestRate = parseFloat(formValue.interestRate) || 0;
    const duration = parseInt(formValue.duration) || 0;

    if (principal > 0 && interestRate >= 0 && duration > 0) {
      const interestAmount = (principal * interestRate) / 100;
      const totalAmount = principal + interestAmount;
      const monthlyAmount = totalAmount / duration;

      this.calculatedValues = {
        principalAmount: principal,
        interestAmount: interestAmount,
        totalAmount: totalAmount,
        monthlyAmount: monthlyAmount
      };

      this.showSummary = true;
    } else {
      this.showSummary = false;
    }
  }

  onSubmit() {
    if (this.loanForm.valid) {
      this.submitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const loanData: CreateLoanData = this.loanForm.value;

      this.loanService.createLoan(loanData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.successMessage = 'Loan created successfully! Redirecting to dashboard...';
          
          setTimeout(() => {
            this.router.navigate(['/owner-dashboard']);
          }, 2000);
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error.error?.message || 'Failed to create loan. Please try again.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loanForm.controls).forEach(key => {
        this.loanForm.get(key)?.markAsTouched();
      });
    }
  }
}