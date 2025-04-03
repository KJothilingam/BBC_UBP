import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'http://localhost:8080/bills';

  constructor(private http: HttpClient) {}

  getBillsByCustomerId(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customer/${customerId}`);
  }
   
  getUnpaidBillsByMeter(meterNumber: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/unpaid/${meterNumber}`);
  }

  getMonthlyStats(customerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/monthly-stats/${customerId}`);
  }
}
