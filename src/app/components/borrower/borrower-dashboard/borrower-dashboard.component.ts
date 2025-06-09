import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoanService } from '../../../services/loan.service';
import { AuthService } from '../../../services/auth.service';
import { Loan } from '../../../models/loan.model';

@Component({
  selector: 'app-borrower-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Borrower Dashboard</h1>
          <div class="header-actions">
            <button class="btn btn-secondary" (click)="logout()">
              <i class="material-icons">logout</i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">account_balance_wallet</i>
            </div>
            <div class="stat-content">
              <h3>₹{{ totalBorrowedAmount | number }}</h3>
              <p>Total Amount Borrowed</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">payment</i>
            </div>
            <div class="stat-content">
              <h3>₹{{ totalAmountPaid | number }}</h3>
              <p>Amount Paid</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">pending</i>
            </div>
            <div class="stat-content">
              <h3>₹{{ totalPendingAmount | number }}</h3>
              <p>Remaining Balance</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="material-icons">schedule</i>
            </div>
            <div class="stat-content">
              <h3>₹{{ nextPaymentAmount | number }}</h3>
              <p>Next Payment Due</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Payments Alert -->
        <div class="alert alert-warning" *ngIf="upcomingPayments.length > 0">
          <div class="alert-content">
            <i class="material-icons">warning</i>
            <div>
              <h4>Upcoming Payments</h4>
              <p>You have {{ upcomingPayments.length }} payment(s) due within the next 7 days.</p>
            </div>
          </div>
        </div>

        <!-- Overdue Payments Alert -->
        <div class="alert alert-error" *ngIf="overduePayments.length > 0">
          <div class="alert-content">
            <i class="material-icons">error</i>
            <div>
              <h4>Overdue Payments</h4>
              <p>You have {{ overduePayments.length }} overdue payment(s). Please make payments as soon as possible.</p>
            </div>
          </div>
        </div>

        <!-- Loans Section -->
        <div class="loans-section">
          <div class="section-header">
            <h2>Your Loans</h2>
            <div class="filter-tabs">
              <button 
                class="filter-tab" 
                [class.active]="selectedFilter === 'all'"
                (click)="setFilter('all')"
              >
                All ({{ loans.length }})
              </button>
              <button 
                class="filter-tab" 
                [class.active]="selectedFilter === 'active'"
                (click)="setFilter('active')"
              >
                Active ({{ getFilteredLoans('active').length }})
              </button>
              <button 
                class="filter-tab" 
                [class.active]="selectedFilter === 'overdue'"
                (click)="setFilter('overdue')"
              >
                Overdue ({{ getFilteredLoans('overdue').length }})
              </button>
              <button 
                class="filter-tab" 
                [class.active]="selectedFilter === 'completed'"
                (click)="setFilter('completed')"
              >
                Completed ({{ getFilteredLoans('completed').length }})
              </button>
            </div>
          </div>

          <div class="loans-grid" *ngIf="!loading; else loadingTemplate">
            <div 
              class="loan-card" 
              *ngFor="let loan of filteredLoans"
              [class.overdue]="loan.status === 'overdue'"
              [class.completed]="loan.status === 'completed'"
              [class.upcoming]="isUpcomingPayment(loan)"
              (click)="viewLoanDetails(loan._id)"
            >
              <div class="loan-header">
                <div class="lender-info">
                  <h3>{{ loan.owner.name }}</h3>
                  <p>{{ loan.owner.email }}</p>
                </div>
                <div class="loan-status">
                  <span class="status-badge" [class]="loan.status">
                    {{ loan.status | titlecase }}
                  </span>
                </div>
              </div>

              <div class="loan-details">
                <div class="detail-row">
                  <span class="label">Principal Amount:</span>
                  <span class="value">₹{{ loan.principalAmount | number }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span>
                  <span class="value">₹{{ loan.totalAmount | number }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Amount Paid:</span>
                  <span class="value">₹{{ loan.amountPaid | number }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Balance:</span>
                  <span class="value balance">₹{{ loan.balanceAmount | number }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Monthly Payment:</span>
                  <span class="value">₹{{ loan.monthlyAmount | number }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Next Payment:</span>
                  <span class="value" [class.overdue-date]="isOverdue(loan)">
                    {{ loan.nextPaymentDate | date:'mediumDate' }}
                  </span>
                </div>
              </div>

              <div class="loan-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    [style.width.%]="(loan.amountPaid / loan.totalAmount) * 100"
                  ></div>
                </div>
                <span class="progress-text">
                  {{ ((loan.amountPaid / loan.totalAmount) * 100) | number:'1.1-1' }}% Paid
                </span>
              </div>

              <div class="payment-info" *ngIf="loan.status === 'active'">
                <div class="payment-method">
                  <i class="material-icons">payment</i>
                  <span>GPay: {{ loan.owner.gpayAccess }}</span>
                </div>
                <div class="days-until-payment" [class.urgent]="getDaysUntilPayment(loan) <= 3">
                  {{ getDaysUntilPayment(loan) }} days until payment
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredLoans.length === 0 && !loading">
            <i class="material-icons">account_balance</i>
            <h3>No loans found</h3>
            <p>{{ getEmptyStateMessage() }}</p>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading loans...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .dashboard-header {
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
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-header h1 {
      color: white;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
    }

    .stat-content h3 {
      font-size: 24px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 4px 0;
    }

    .stat-content p {
      color: #718096;
      margin: 0;
      font-size: 14px;
    }

    .alert {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .alert-warning {
      border-left: 4px solid #f59e0b;
    }

    .alert-error {
      border-left: 4px solid #ef4444;
    }

    .alert-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .alert-content i {
      color: #f59e0b;
      font-size: 24px;
    }

    .alert-error .alert-content i {
      color: #ef4444;
    }

    .alert-content h4 {
      margin: 0 0 4px 0;
      color: #1a202c;
      font-size: 16px;
    }

    .alert-content p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }

    .loans-section {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .section-header {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .section-header h2 {
      color: #1a202c;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }

    .filter-tabs {
      display: flex;
      gap: 8px;
    }

    .filter-tab {
      padding: 8px 16px;
      border: 1px solid #e5e7eb;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .filter-tab:hover {
      background: #f9fafb;
    }

    .filter-tab.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .loans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      padding: 24px;
    }

    .loan-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;
    }

    .loan-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .loan-card.overdue {
      border-left: 4px solid #ef4444;
    }

    .loan-card.completed {
      border-left: 4px solid #10b981;
    }

    .loan-card.upcoming {
      border-left: 4px solid #f59e0b;
    }

    .loan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .lender-info h3 {
      color: #1a202c;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .lender-info p {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
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

    .loan-details {
      margin-bottom: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .detail-row .label {
      color: #6b7280;
      font-size: 14px;
    }

    .detail-row .value {
      color: #1a202c;
      font-weight: 500;
      font-size: 14px;
    }

    .detail-row .balance {
      color: #ef4444;
      font-weight: 600;
    }

    .detail-row .overdue-date {
      color: #ef4444;
      font-weight: 600;
    }

    .loan-progress {
      margin-bottom: 16px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #f3f4f6;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 12px;
      color: #6b7280;
    }

    .payment-info {
      border-top: 1px solid #f3f4f6;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-method {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      font-size: 14px;
    }

    .payment-method i {
      font-size: 18px;
    }

    .days-until-payment {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
    }

    .days-until-payment.urgent {
      color: #ef4444;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6b7280;
    }

    .empty-state i {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 18px;
      margin-bottom: 8px;
      color: #374151;
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
      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .loans-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-tabs {
        justify-content: center;
        flex-wrap: wrap;
      }

      .payment-info {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }
    }
  `]
})
export class BorrowerDashboardComponent implements OnInit {
  loans: Loan[] = [];
  filteredLoans: Loan[] = [];
  selectedFilter = 'all';
  loading = true;

  // Statistics
  totalBorrowedAmount = 0;
  totalAmountPaid = 0;
  totalPendingAmount = 0;
  nextPaymentAmount = 0;

  // Alerts
  upcomingPayments: Loan[] = [];
  overduePayments: Loan[] = [];

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loading = true;
    this.loanService.getLoans().subscribe({
      next: (loans) => {
        this.loans = loans;
        this.calculateStatistics();
        this.checkPaymentAlerts();
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading loans:', error);
        this.loading = false;
      }
    });
  }

  calculateStatistics() {
    this.totalBorrowedAmount = this.loans.reduce((sum, loan) => sum + loan.totalAmount, 0);
    this.totalAmountPaid = this.loans.reduce((sum, loan) => sum + loan.amountPaid, 0);
    this.totalPendingAmount = this.loans.reduce((sum, loan) => sum + loan.balanceAmount, 0);
    
    // Calculate next payment amount (sum of all active loans' monthly payments)
    this.nextPaymentAmount = this.loans
      .filter(loan => loan.status === 'active')
      .reduce((sum, loan) => sum + loan.monthlyAmount, 0);
  }

  checkPaymentAlerts() {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    this.upcomingPayments = this.loans.filter(loan => {
      if (loan.status !== 'active') return false;
      const paymentDate = new Date(loan.nextPaymentDate);
      return paymentDate >= today && paymentDate <= sevenDaysFromNow;
    });

    this.overduePayments = this.loans.filter(loan => loan.status === 'overdue');
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedFilter === 'all') {
      this.filteredLoans = this.loans;
    } else {
      this.filteredLoans = this.loans.filter(loan => loan.status === this.selectedFilter);
    }
  }

  getFilteredLoans(status: string): Loan[] {
    return this.loans.filter(loan => loan.status === status);
  }

  getEmptyStateMessage(): string {
    switch (this.selectedFilter) {
      case 'active':
        return 'No active loans at the moment.';
      case 'overdue':
        return 'No overdue loans. Great job staying on track!';
      case 'completed':
        return 'No completed loans yet.';
      default:
        return 'You don\'t have any loans yet.';
    }
  }

  isUpcomingPayment(loan: Loan): boolean {
    if (loan.status !== 'active') return false;
    const today = new Date();
    const paymentDate = new Date(loan.nextPaymentDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return paymentDate >= today && paymentDate <= sevenDaysFromNow;
  }

  isOverdue(loan: Loan): boolean {
    return loan.status === 'overdue' || new Date(loan.nextPaymentDate) < new Date();
  }

  getDaysUntilPayment(loan: Loan): number {
    const today = new Date();
    const paymentDate = new Date(loan.nextPaymentDate);
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  viewLoanDetails(loanId: string) {
    this.router.navigate(['/borrower/loan', loanId]);
  }

  logout() {
    this.authService.logout();
  }
}