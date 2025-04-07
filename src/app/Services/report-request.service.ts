import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportRequest {
  requestType: string;
  status: 'COMPLETED' | 'IN_PROCESS' | 'SUCCESS' | 'DECLINED';
  details?: string;
  billId?: number;
  extendDays?: number;
  newValue?: string;
  customerId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportRequestService {
  private apiUrl = 'http://localhost:8080/report';

  constructor(private http: HttpClient) {}

  submitRequest(request: ReportRequest): Observable<ReportRequest> {
    return this.http.post<ReportRequest>(`${this.apiUrl}`, request);
  }

  getRequestsByCustomerId(customerId: number): Observable<ReportRequest[]> {
    return this.http.get<ReportRequest[]>(`${this.apiUrl}/customer/${customerId}`);
  }
}
