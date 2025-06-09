import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'owner-dashboard',
    loadComponent: () => import('./components/owner/owner-dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'owner' }
  },
  {
    path: 'borrower-dashboard',
    loadComponent: () => import('./components/borrower/borrower-dashboard/borrower-dashboard.component').then(m => m.BorrowerDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'borrower' }
  },
  {
    path: 'owner/loan/:id',
    loadComponent: () => import('./components/owner/loan-details/loan-details.component').then(m => m.LoanDetailsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'owner' }
  },
  {
    path: 'borrower/loan/:id',
    loadComponent: () => import('./components/borrower/loan-details/loan-details.component').then(m => m.BorrowerLoanDetailsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'borrower' }
  },
  {
    path: 'create-loan',
    loadComponent: () => import('./components/owner/create-loan/create-loan.component').then(m => m.CreateLoanComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'owner' }
  },
  { path: '**', redirectTo: '/login' }
];