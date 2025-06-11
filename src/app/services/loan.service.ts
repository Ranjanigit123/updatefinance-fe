import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan, CreateLoanData, PaymentData, UpdateLoanData } from '../models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'https://updatefinance-be.onrender.com/api/loans';

  constructor(private http: HttpClient) {}

  createLoan(data: CreateLoanData): Observable<{ message: string; loan: Loan }> {
    return this.http.post<{ message: string; loan: Loan }>(this.apiUrl, data);
  }

  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.apiUrl);
  }

  getLoan(id: string): Observable<Loan> {
    return this.http.get<Loan>(`${this.apiUrl}/${id}`);
  }

  makePayment(loanId: string, data: PaymentData): Observable<{ message: string; loan: Loan }> {
    return this.http.post<{ message: string; loan: Loan }>(`${this.apiUrl}/${loanId}/payment`, data);
  }

  updateLoanStatus(loanId: string, data: UpdateLoanData): Observable<{ message: string; loan: Loan }> {
    return this.http.patch<{ message: string; loan: Loan }>(`${this.apiUrl}/${loanId}/status`, data);
  }

  deleteLoan(loanId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${loanId}`);
  }
}