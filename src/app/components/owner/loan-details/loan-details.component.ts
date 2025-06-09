//C:\financebolt\frontend\src\app\components\owner\loan-details\loan-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanService } from '../../../services/loan.service';
import { Loan, PaymentData } from '../../../models/loan.model';

@Component({
  selector: 'app-loan-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="loan-details-container">
      <header class="page-header">
        <div class="header-content">
          <button class="btn btn-back" routerLink="/owner-dashboard">
            <i class="material-icons">arrow_back</i>
            Back to Dashboard
          </button>
          <h1>Loan Details</h1>
        </div>
      </header>

      <div class="content" *ngIf="loan && !loading; else loadingTemplate">
        <div class="loan-overview">
          <div class="overview-card">
            <div class="borrower-section">
              <div class="borrower-avatar">
                <img [src]="loan.borrower.photo || '/assets/default-avatar.png'" 
                     [alt]="loan.borrower.name"
                     onerror="this.src='/assets/default-avatar.png'">
              </div>
              <div class="borrower-info">
                <h2>{{ loan.borrower.name }}</h2>
                <p class="email">{{ loan.borrower.email }}</p>
                <p class="mobile">{{ loan.borrower.mobile }}</p>
                <div class="status-badge" [class]="loan.status">
                  {{ loan.status | titlecase }}
                </div>
              </div>
            </div>

            <div class="loan-summary">
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Principal Amount</span>
                  <span class="value">₹{{ loan.principalAmount | number }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Interest Rate</span>
                  <span class="value">{{ loan.interestRate }}%</span>
                </div>
                <div class="summary-item">
                  <span class="label">Total Amount</span>
                  <span class="value">₹{{ loan.totalAmount | number }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Duration</span>
                  <span class="value">{{ loan.duration }} months</span>
                </div>
                <div class="summary-item">
                  <span class="label">Monthly Payment</span>
                  <span class="value">₹{{ loan.monthlyAmount | number }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Amount Paid</span>
                  <span class="value paid">₹{{ loan.amountPaid | number }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Balance Amount</span>
                  <span class="value balance">₹{{ loan.balanceAmount | number }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Next Payment Date</span>
                  <span class="value" [class.overdue]="isOverdue()">
                    {{ loan.nextPaymentDate | date:'mediumDate' }}
                  </span>
                </div>
              </div>

              <div class="progress-section">
                <div class="progress-header">
                  <span>Payment Progress</span>
                  <span class="percentage">{{ getPaymentPercentage() }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="getPaymentPercentage()"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="actions-section">
          <div class="actions-card">
            <h3>Quick Actions</h3>
            <div class="actions-grid">
              <button class="action-btn" (click)="showAddPaymentModal = true" [disabled]="loan.status === 'completed'">
                <i class="material-icons">payment</i>
                <span>Record Payment</span>
              </button>
              <button class="action-btn" (click)="showUpdateModal = true" [disabled]="loan.status === 'completed'">
                <i class="material-icons">edit</i>
                <span>Update Loan</span>
              </button>
              <button class="action-btn danger" (click)="deleteLoan()" [disabled]="loan.status !== 'completed'">
                <i class="material-icons">delete</i>
                <span>Delete Loan</span>
              </button>
            </div>
          </div>
        </div>

        <div class="payment-history">
          <div class="history-card">
            <h3>Payment History</h3>
            <div class="history-list" *ngIf="loan.paymentHistory.length > 0; else noPayments">
              <div class="payment-item" *ngFor="let payment of loan.paymentHistory; trackBy: trackPayment">
                <div class="payment-info">
                  <div class="payment-amount">₹{{ payment.amount | number }}</div>
                  <div class="payment-date">{{ payment.date | date:'mediumDate' }}</div>
                  <div class="payment-method">
                    <i class="material-icons">{{ payment.method === 'online' ? 'payment' : 'money' }}</i>
                    {{ payment.method | titlecase }}
                  </div>
                </div>
                <div class="payment-details" *ngIf="payment.transactionId || payment.notes">
                  <div *ngIf="payment.transactionId" class="transaction-id">
                    Transaction ID: {{ payment.transactionId }}
                  </div>
                  <div *ngIf="payment.notes" class="payment-notes">
                    {{ payment.notes }}
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noPayments>
              <div class="empty-state">
                <i class="material-icons">payment</i>
                <p>No payments recorded yet</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Add Payment Modal -->
      <div class="modal-overlay" *ngIf="showAddPaymentModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Record Payment</h3>
            <button class="close-btn" (click)="closeModal()">
              <i class="material-icons">close</i>
            </button>
          </div>
          <form [formGroup]="paymentForm" (ngSubmit)="addPayment()" class="modal-content">
            <div class="form-group">
              <label class="form-label">Payment Amount</label>
              <input
                type="number"
                formControlName="amount"
                class="form-input"
                placeholder="Enter payment amount"
                [class.error]="paymentForm.get('amount')?.invalid && paymentForm.get('amount')?.touched"
              >
              <div class="field-error" *ngIf="paymentForm.get('amount')?.invalid && paymentForm.get('amount')?.touched">
                <span *ngIf="paymentForm.get('amount')?.errors?.['required']">Amount is required</span>
                <span *ngIf="paymentForm.get('amount')?.errors?.['min']">Amount must be greater than 0</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Payment Method</label>
              <select formControlName="method" class="form-select">
                <option value="online">Online Payment</option>
                <option value="cash">Cash Payment</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Transaction ID (Optional)</label>
              <input
                type="text"
                formControlName="transactionId"
                class="form-input"
                placeholder="Enter transaction ID"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Notes (Optional)</label>
              <textarea
                formControlName="notes"
                class="form-input"
                rows="3"
                placeholder="Add any notes about this payment"
              ></textarea>
            </div>

            <div class="alert alert-error" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="paymentForm.invalid || submitting">
                <span *ngIf="submitting" class="loading-spinner"></span>
                {{ submitting ? 'Recording...' : 'Record Payment' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Update Loan Modal -->
      <div class="modal-overlay" *ngIf="showUpdateModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Update Loan</h3>
            <button class="close-btn" (click)="closeModal()">
              <i class="material-icons">close</i>
            </button>
          </div>
          <form [formGroup]="updateForm" (ngSubmit)="updateLoan()" class="modal-content">
            <div class="form-group">
              <label class="form-label">Last Payment Date</label>
              <input
                type="date"
                formControlName="lastPaymentDate"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Total Amount Paid</label>
              <input
                type="number"
                formControlName="amountPaid"
                class="form-input"
                placeholder="Enter total amount paid"
                [class.error]="updateForm.get('amountPaid')?.invalid && updateForm.get('amountPaid')?.touched"
              >
              <div class="field-error" *ngIf="updateForm.get('amountPaid')?.invalid && updateForm.get('amountPaid')?.touched">
                <span *ngIf="updateForm.get('amountPaid')?.errors?.['min']">Amount must be 0 or greater</span>
                <span *ngIf="updateForm.get('amountPaid')?.errors?.['max']">Amount cannot exceed total loan amount</span>
              </div>
            </div>

            <div class="alert alert-error" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="updateForm.invalid || submitting">
                <span *ngIf="submitting" class="loading-spinner"></span>
                {{ submitting ? 'Updating...' : 'Update Loan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading loan details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .loan-details-container {
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
      gap: 24px;
    }

    .overview-card, .actions-card, .history-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .borrower-section {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .borrower-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #e5e7eb;
    }

    .borrower-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .borrower-info h2 {
      color: #1a202c;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .borrower-info .email, .borrower-info .mobile {
      color: #6b7280;
      margin: 4px 0;
      font-size: 14px;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      margin-top: 8px;
    }

    .status-badge.active {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-badge.overdue {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-badge.completed {
      background: #d1fae5;
      color: #065f46;
    }

    .loan-summary {
      padding: 24px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .summary-item .label {
      color: #6b7280;
      font-size: 14px;
    }

    .summary-item .value {
      color: #1a202c;
      font-size: 18px;
      font-weight: 600;
    }

    .summary-item .value.paid {
      color: #10b981;
    }

    .summary-item .value.balance {
      color: #ef4444;
    }

    .summary-item .value.overdue {
      color: #ef4444;
    }

    .progress-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 24px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .progress-header span {
      font-weight: 500;
      color: #374151;
    }

    .percentage {
      color: #10b981;
      font-weight: 600;
    }

    .progress-bar {
      width: 100%;
      height: 12px;
      background: #f3f4f6;
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      transition: width 0.3s ease;
    }

    .actions-card {
      padding: 24px;
    }

    .actions-card h3 {
      color: #1a202c;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      color: #374151;
    }

    .action-btn:hover:not(:disabled) {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn.danger:hover:not(:disabled) {
      border-color: #ef4444;
      background: #fef2f2;
      color: #dc2626;
    }

    .action-btn i {
      font-size: 24px;
    }

    .action-btn span {
      font-size: 14px;
      font-weight: 500;
    }

    .history-card {
      padding: 24px;
    }

    .history-card h3 {
      color: #1a202c;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px 0;
    }

    .payment-item {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .payment-info {
      display: grid;
      grid-template-columns: auto auto 1fr;
      gap: 16px;
      align-items: center;
    }

    .payment-amount {
      font-size: 18px;
      font-weight: 600;
      color: #10b981;
    }

    .payment-date {
      color: #6b7280;
      font-size: 14px;
    }

    .payment-method {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #6b7280;
      font-size: 14px;
      justify-self: end;
    }

    .payment-details {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .transaction-id, .payment-notes {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #6b7280;
    }

    .empty-state i {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal {
      background: white;
      border-radius: 16px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      color: #1a202c;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .close-btn:hover {
      background: #f3f4f6;
    }

    .modal-content {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
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

    .form-input.error {
      border-color: #ef4444;
    }

    .field-error {
      margin-top: 6px;
      font-size: 12px;
      color: #ef4444;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
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

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #6b7280;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .borrower-section {
        flex-direction: column;
        text-align: center;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .payment-info {
        grid-template-columns: 1fr;
        gap: 8px;
        text-align: center;
      }

      .payment-method {
        justify-self: center;
      }
    }
  `]
})
export class LoanDetailsComponent implements OnInit {
  loan: Loan | null = null;
  loading = true;
  showAddPaymentModal = false;
  showUpdateModal = false;
  submitting = false;
  errorMessage = '';

  paymentForm: FormGroup;
  updateForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      method: ['online', [Validators.required]],
      transactionId: [''],
      notes: ['']
    });

    this.updateForm = this.fb.group({
      lastPaymentDate: [''],
      amountPaid: ['', [Validators.min(0)]]
    });
  }

  ngOnInit() {
    const loanId = this.route.snapshot.paramMap.get('id');
    if (loanId) {
      this.loadLoan(loanId);
    }
  }

  loadLoan(id: string) {
    this.loading = true;
    this.loanService.getLoan(id).subscribe({
      next: (loan) => {
        this.loan = loan;
        this.updateForm.patchValue({
          lastPaymentDate: loan.lastPaymentDate ? new Date(loan.lastPaymentDate).toISOString().split('T')[0] : '',
          amountPaid: loan.amountPaid
        });
        this.updateForm.get('amountPaid')?.setValidators([
          Validators.min(0),
          Validators.max(loan.totalAmount)
        ]);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading loan:', error);
        this.loading = false;
        this.router.navigate(['/owner-dashboard']);
      }
    });
  }

  getPaymentPercentage(): number {
    if (!this.loan) return 0;
    return Math.round((this.loan.amountPaid / this.loan.totalAmount) * 100);
  }

  isOverdue(): boolean {
    if (!this.loan) return false;
    return new Date(this.loan.nextPaymentDate) < new Date() && this.loan.status === 'active';
  }

  addPayment() {
    if (this.paymentForm.valid && this.loan) {
      this.submitting = true;
      this.errorMessage = '';

      const paymentData: PaymentData = this.paymentForm.value;

      this.loanService.makePayment(this.loan._id, paymentData).subscribe({
        next: (response) => {
          this.loan = response.loan;
          this.submitting = false;
          this.closeModal();
          this.paymentForm.reset({ method: 'online' });
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error.error?.message || 'Failed to record payment';
        }
      });
    }
  }

  updateLoan() {
    if (this.updateForm.valid && this.loan) {
      this.submitting = true;
      this.errorMessage = '';

      const updateData = this.updateForm.value;
      // Remove empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null) {
          delete updateData[key];
        }
      });

      this.loanService.updateLoanStatus(this.loan._id, updateData).subscribe({
        next: (response) => {
          this.loan = response.loan;
          this.submitting = false;
          this.closeModal();
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = error.error?.message || 'Failed to update loan';
        }
      });
    }
  }

  deleteLoan() {
    if (this.loan && confirm('Are you sure you want to delete this completed loan? This action cannot be undone.')) {
      this.loanService.deleteLoan(this.loan._id).subscribe({
        next: () => {
          this.router.navigate(['/owner-dashboard']);
        },
        error: (error) => {
          alert('Failed to delete loan: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  closeModal() {
    this.showAddPaymentModal = false;
    this.showUpdateModal = false;
    this.errorMessage = '';
    this.submitting = false;
  }

  trackPayment(index: number, payment: any): any {
    return payment.date + payment.amount;
  }
}