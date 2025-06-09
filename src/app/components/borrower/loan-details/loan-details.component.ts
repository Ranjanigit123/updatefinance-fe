import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanService } from '../../../services/loan.service';
import { Loan } from '../../../models/loan.model';

@Component({
  selector: 'app-borrower-loan-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="loan-details-container">
      <header class="page-header">
        <div class="header-content">
          <button class="btn btn-back" routerLink="/borrower-dashboard">
            <i class="material-icons">arrow_back</i>
            Back to Dashboard
          </button>
          <h1>Loan Details</h1>
        </div>
      </header>

      <div class="content" *ngIf="loan && !loading; else loadingTemplate">
        <div class="loan-overview">
          <div class="overview-card">
            <div class="lender-section">
              <div class="lender-info">
                <h2>{{ loan.owner.name }}</h2>
                <p class="email">{{ loan.owner.email }}</p>
                <p class="mobile">{{ loan.owner.mobile }}</p>
                <div class="status-badge" [class]="loan.status">
                  {{ loan.status | titlecase }}
                </div>
              </div>
              <div class="payment-qr" *ngIf="loan.owner.qrCode">
                <h4>Payment QR Code</h4>
                <img [src]="loan.owner.qrCode" alt="Payment QR Code" class="qr-image">
                <p class="gpay-info">GPay: {{ loan.owner.gpayAccess }}</p>
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
                  <span class="value monthly">₹{{ loan.monthlyAmount | number }}</span>
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

        <!-- Payment Instructions -->
        <div class="payment-instructions" *ngIf="loan.status === 'active'">
          <div class="instructions-card">
            <h3>
              <i class="material-icons">info</i>
              Payment Instructions
            </h3>
            <div class="instructions-content">
              <div class="instruction-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Make Payment</h4>
                  <p>Use the QR code above or send money to GPay number: <strong>{{ loan.owner.gpayAccess }}</strong></p>
                </div>
              </div>
              <div class="instruction-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Send Screenshot</h4>
                  <p>After payment, send a screenshot to: <strong>{{ loan.owner.email }}</strong></p>
                </div>
              </div>
              <div class="instruction-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Wait for Confirmation</h4>
                  <p>The lender will update your payment status once verified</p>
                </div>
              </div>
            </div>
            
            <div class="payment-reminder" [class.urgent]="getDaysUntilPayment() <= 3">
              <i class="material-icons">{{ getDaysUntilPayment() <= 3 ? 'warning' : 'schedule' }}</i>
              <span>
                {{ getDaysUntilPayment() === 0 ? 'Payment due today!' : 
                   getDaysUntilPayment() < 0 ? 'Payment overdue by ' + window.Math.abs(getDaysUntilPayment()) + ' days' :
                   getDaysUntilPayment() + ' days until payment due' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Payment History -->
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
                <small>Make your first payment using the instructions above</small>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Loan Terms -->
        <div class="loan-terms">
          <div class="terms-card">
            <h3>Loan Terms & Information</h3>
            <div class="terms-grid">
              <div class="term-item">
                <span class="term-label">Start Date</span>
                <span class="term-value">{{ loan.startDate | date:'mediumDate' }}</span>
              </div>
              <div class="term-item">
                <span class="term-label">Last Payment</span>
                <span class="term-value">
                  {{ loan.lastPaymentDate ? (loan.lastPaymentDate | date:'mediumDate') : 'No payments yet' }}
                </span>
              </div>
              <div class="term-item">
                <span class="term-label">Created On</span>
                <span class="term-value">{{ loan.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="term-item">
                <span class="term-label">Interest Amount</span>
                <span class="term-value">₹{{ (loan.totalAmount - loan.principalAmount) | number }}</span>
              </div>
            </div>
          </div>
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

    .overview-card, .instructions-card, .history-card, .terms-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .lender-section {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .lender-info h2 {
      color: #1a202c;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .lender-info .email, .lender-info .mobile {
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

    .payment-qr {
      text-align: center;
    }

    .payment-qr h4 {
      color: #374151;
      font-size: 16px;
      margin: 0 0 12px 0;
    }

    .qr-image {
      width: 150px;
      height: 150px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .gpay-info {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
      font-weight: 500;
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

    .summary-item .value.monthly {
      color: #3b82f6;
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

    .instructions-card {
      padding: 24px;
    }

    .instructions-card h3 {
      color: #1a202c;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .instructions-content {
      margin-bottom: 20px;
    }

    .instruction-step {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      align-items: flex-start;
    }

    .step-number {
      width: 32px;
      height: 32px;
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .step-content h4 {
      color: #1a202c;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .step-content p {
      color: #6b7280;
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    }

    .payment-reminder {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #92400e;
    }

    .payment-reminder.urgent {
      background: #fee2e2;
      border-color: #ef4444;
      color: #dc2626;
    }

    .payment-reminder i {
      font-size: 20px;
    }

    .history-card, .terms-card {
      padding: 24px;
    }

    .history-card h3, .terms-card h3 {
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

    .terms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .term-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .term-label {
      color: #6b7280;
      font-size: 14px;
    }

    .term-value {
      color: #1a202c;
      font-weight: 500;
      font-size: 16px;
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

    .empty-state small {
      display: block;
      margin-top: 8px;
      font-size: 12px;
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .lender-section {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .summary-grid, .terms-grid {
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

      .instruction-step {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class BorrowerLoanDetailsComponent implements OnInit {
  loan: Loan | null = null;
  loading = true;
window: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService
  ) {}

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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading loan:', error);
        this.loading = false;
        this.router.navigate(['/borrower-dashboard']);
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

  getDaysUntilPayment(): number {
    if (!this.loan) return 0;
    const today = new Date();
    const paymentDate = new Date(this.loan.nextPaymentDate);
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  trackPayment(index: number, payment: any): any {
    return payment.date + payment.amount;
  }
}