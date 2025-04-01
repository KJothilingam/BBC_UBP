import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Wallet {
  creditCardBalance: number;
  debitCardBalance: number;
  upiBalance: number;
  walletBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private baseUrl = 'http://localhost:8080/wallets';

  constructor(private http: HttpClient) {}

  getWalletBalance(customerId: number): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.baseUrl}/${customerId}`);
  }
  addMoney(customerId: number, amount: number, paymentMethod: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add-money`, { customerId, amount, paymentMethod });
  }
}
