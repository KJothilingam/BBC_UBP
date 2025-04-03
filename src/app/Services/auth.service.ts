import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/customers'; // ✅ Backend API URL

   getCustomerId(): number {
    return Number(localStorage.getItem('customerId')) || 0;
  }

  getCustomerDetails(): Observable<any> {
    const customerId = this.getCustomerId();
    if (customerId) {
      return this.http.get(`${this.apiUrl}/${customerId}`);
    }
    throw new Error('Customer ID not found in local storage.');
  }

  

  getCustomerName(): string {
    return localStorage.getItem('customerName') || 'Guest';
  }


  constructor(private http: HttpClient) {}

  generateOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }
  
}