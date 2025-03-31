import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getUserDetails() {
    throw new Error('Method not implemented.');
  }
  getCustomerId(): number {
    return Number(localStorage.getItem('customerId')) || 0;
  }

  getCustomerName(): string {
    return localStorage.getItem('customerName') || 'Guest';
  }

  private apiUrl = 'http://localhost:8080/customers'; // ✅ Backend API URL

  constructor(private http: HttpClient) {}

  generateOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }
  
}