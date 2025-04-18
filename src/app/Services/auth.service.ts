import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ToastrService, ActiveToast } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/customers';
  private jwtToken: string | null = null;
  private warningTimer: any;
  private inactivityTimer: any;
  private countdownTimer: any;
  private remainingSeconds = 60;
  private countdownToast: ActiveToast<any> | null = null;

  constructor(private http: HttpClient, private toastr: ToastrService, private router: Router) {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      this.jwtToken = token;
      this.startInactivityWatcher();
    }

    window.addEventListener('storage', (event) => {
      if (event.key === 'jwtToken') {
        this.jwtToken = event.newValue;
      }
    });

    ['click', 'mousemove', 'keydown', 'scroll'].forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer());
    });
  }

  private startInactivityWatcher() {
    this.resetInactivityTimer();
  }

  private resetInactivityTimer() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.toastr.clear();

    this.remainingSeconds = 60;

    //  After 4 min of inactivity: show warning toast and start countdown
    this.warningTimer = setTimeout(() => {
      this.countdownToast = this.toastr.warning(
        `You will be logged out in ${this.remainingSeconds} seconds due to inactivity.`,
        'Inactivity Warning',
        {
          disableTimeOut: true,
          tapToDismiss: false,
          toastClass: 'ngx-toastr countdown-toast'
        }
      );

      // Start countdown
      this.countdownTimer = setInterval(() => {
        this.remainingSeconds--;

        const toastElement = document.querySelector('.countdown-toast .toast-message');
        if (toastElement) {
          toastElement.textContent = `You will be logged out in ${this.remainingSeconds} seconds due to inactivity.`;
        }

        if (this.remainingSeconds <= 0) {
          clearInterval(this.countdownTimer);
        }
      }, 1000);
    }, 4 * 60 * 1000); // 4 minute

    //  5 min: Auto logout
    this.inactivityTimer = setTimeout(() => {
      console.log('User inactive for 5 minutes. Logging out...');
      this.logout();
    }, 5 * 60 * 1000); // 2 minutes
  }

  logout(): void {
    const token = this.getToken();

    if (token) {
      this.http.post('http://localhost:8080/customers/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe({
        next: () => console.log("Customer backend logout successful"),
        error: err => console.error("Customer logout API failed", err)
      });
    }

    this.jwtToken = null;
    localStorage.clear();

    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.toastr.clear();

    this.router.navigate(['/login']);
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
            this.startInactivityWatcher();
            observer.next(res);
          } else {
            observer.error({ message: "Invalid response" });
          }
        },
        error: (err) => observer.error(err),
      });
    });
  }

  getToken(): string | null {
    return this.jwtToken || localStorage.getItem('jwtToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
