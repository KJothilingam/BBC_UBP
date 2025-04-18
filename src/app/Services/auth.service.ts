import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/customers';
  private jwtToken: string | null = null;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      this.jwtToken = token;
    }
  }
  ngOnInit() {
    // Listen for storage changes (when token is added or removed)
    window.addEventListener('storage', (event) => {
      if (event.key === 'jwtToken' && event.newValue) {
        this.jwtToken = event.newValue;  // Sync token with class property
      }
    });
  }
 
  getCustomerId(): number {
    return Number(localStorage.getItem('customerId')) || 0;
  }

  getCustomerName(): string {
    return localStorage.getItem('customerName') || '';
  }
  getCustomerDetails(): Observable<any> {
    const customerId = this.getCustomerId();
    if (customerId) {
      return this.http.get(`${this.apiUrl}/${customerId}`);
    }
    throw new Error('Customer ID not found in local storage.');
  }

  generateOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return new Observable((observer) => {
      this.http.post(`${this.apiUrl}/verify-otp`, { email, otp }).subscribe({
        next: (res: any) => {
          if (res.customerId && res.customerName && res.token) {
            localStorage.setItem('customerId', res.customerId);
            localStorage.setItem('customerName', res.customerName);
            localStorage.setItem('jwtToken', res.token);
            
            this.jwtToken = res.token;
            observer.next(res);
          } else {
            observer.error({ message: "Invalid response" });
          }
        },
        error: (err) => observer.error(err),
      });
    });
  }
  logout(): void {
    const token = this.getToken();
  
    if (token) {
      this.http.post('http://localhost:8080/customers/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe({
        next: () => console.log(" Customer backend logout successful"),
        error: err => console.error(" Customer logout API failed", err)
      });
    }
  
    this.jwtToken = null;
    localStorage.clear();
  
    window.location.href = 'http://localhost:5200';
  }
  
  
  getToken(): string | null {
    return this.jwtToken || localStorage.getItem('jwtToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
}