import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportRequestService } from '../../Services/report-request.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../Services/auth.service';

export type RequestStatus = 'COMPLETED' | 'IN_PROCESS' | 'SUCCESS' | 'DECLINED';

export interface CustomerRequest {
  requestId?: number;
  requestType: string;
  billId?: number;
  newValue?: string;
  extendDays?: number;
  details?: string;
  customerId?: number;
  requestDate?: string;
  status: RequestStatus;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
  selectedRequestType = '';
  newRequest: CustomerRequest = this.initializeRequest();
  customerRequests: CustomerRequest[] = [];
  customerId: number = 0;

  constructor(
    private reportService: ReportRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.customerId = this.authService.getCustomerId();
    this.fetchCustomerRequests();
  }

  fetchCustomerRequests(): void {
    this.reportService.getRequestsByCustomerId(this.customerId).subscribe({
      next: (res) => (this.customerRequests = res),
      error: (err) => console.error('Error fetching requests:', err),
    });
  }

  submitRequest(): void {
    if (this.isBillIdRequired() && !this.newRequest.billId) {
      alert('Bill ID is required.');
      return;
    }

    if (this.isNewValueRequired() && !this.newRequest.newValue) {
      alert('New value is required.');
      return;
    }

    if (this.isExtendDaysRequired() && !this.newRequest.extendDays) {
      alert('Extend days is required.');
      return;
    }

    this.newRequest.requestType = this.selectedRequestType;
    this.newRequest.customerId = this.customerId;

    this.reportService.submitRequest(this.newRequest).subscribe({
      next: (res) => {
        this.customerRequests.push(res);
        this.resetForm();
      },
      error: (err) => console.error('Error submitting request:', err),
    });
  }

  resetForm(): void {
    this.newRequest = this.initializeRequest();
    this.selectedRequestType = '';
  }

  initializeRequest(): CustomerRequest {
    return {
      requestType: '',
      status: 'IN_PROCESS',
      billId: undefined,
      newValue: '',
      extendDays: undefined,
      details: '',
      customerId: this.customerId,
      requestDate: ''
    };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'status-success';
      case 'IN_PROCESS': return 'status-inprocess';
      case 'COMPLETED': return 'status-completed';
      case 'DECLINED': return 'status-declined';
      default: return '';
    }
  }

  isBillIdRequired(): boolean {
    return this.selectedRequestType === 'READING_FAULT' || this.selectedRequestType === 'EXTEND_DUE_DATE';
  }

  isNewValueRequired(): boolean {
    return ['NAME_CHANGE', 'EMAIL_CHANGE', 'PHONE_CHANGE', 'ADDRESS_CHANGE'].includes(this.selectedRequestType);
  }

  isExtendDaysRequired(): boolean {
    return this.selectedRequestType === 'EXTEND_DUE_DATE';
  }
}
