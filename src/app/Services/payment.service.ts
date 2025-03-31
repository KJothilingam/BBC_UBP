import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { PaymentRequest, PaymentResponse } from '../Interfaces/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/payments/process';

  constructor(private http: HttpClient) {}

  processPayment(paymentData: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.apiUrl, paymentData);
  }
}
