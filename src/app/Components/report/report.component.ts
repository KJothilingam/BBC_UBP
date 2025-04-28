import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportRequestService } from '../../Services/report-request.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../Services/auth.service';
import { BillService } from '../../Services/bill.service';
import { ReportRequestType } from '../../Enum/ReportRequestType.enum';
import { RequestStatus } from '../../Enum/RequestStatus.enum';
import { CustomerRequest } from '../../Interface/CustomerRequest';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
  selectedRequestType: ReportRequestType = ReportRequestType.READING_UNIT_CONSUMED_FAULT;
  newRequest: CustomerRequest = this.initializeRequest();
  customerRequests: CustomerRequest[] = [];
  pendingBills: any[] = [];
  customerId: number = 0;

  constructor(
    private reportService: ReportRequestService,
    private authService: AuthService,
    private billService: BillService
  ) {}

  ngOnInit(): void {
    this.customerId = this.authService.getCustomerId();
    this.fetchCustomerRequests();
    this.fetchPendingBills();
  }

  fetchCustomerRequests(): void {
    this.reportService.getRequestsByCustomerId(this.customerId).subscribe({
      next: (res) => {
        this.customerRequests = res.map((request: any) => ({
          ...request,
          requestType: ReportRequestType[request.requestType as keyof typeof ReportRequestType],
          status: request.status as RequestStatus,
        }));
      },
      error: (err) => console.error('Error fetching requests:', err),
    });
  }

  fetchPendingBills(): void {
    this.billService.getBillsByCustomerId(this.customerId.toString()).subscribe({
      next: (bills) => {
        this.pendingBills = bills.filter(
          (bill: any) => bill.paymentStatus === 'PENDING' || bill.paymentStatus === 'OVERDUE'
        );
      },
      error: (err) => console.error('Error fetching pending bills:', err),
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
        const mappedRequest: CustomerRequest = {
          ...res,
          requestType: ReportRequestType[res.requestType as keyof typeof ReportRequestType],
          status: res.status as RequestStatus,
        };
        this.customerRequests.push(mappedRequest);
        this.resetForm();
      },
      error: (err) => console.error('Error submitting request:', err),
    });
  }

  resetForm(): void {
    this.newRequest = this.initializeRequest();
    this.selectedRequestType = ReportRequestType.READING_UNIT_CONSUMED_FAULT;
  }

  initializeRequest(): CustomerRequest {
    return {
      requestType: ReportRequestType.READING_UNIT_CONSUMED_FAULT,
      status: 'IN_PROCESS',
      billId: undefined,
      newValue: '',
      extendDays: undefined,
      details: '',
      customerId: this.customerId,
      requestDate: ''
    };
  }

  isBillIdRequired(): boolean {
    return [
      ReportRequestType.READING_UNIT_CONSUMED_FAULT,
      ReportRequestType.EXTEND_DUE_DATE,
      ReportRequestType.BILL_WAIVE_OFF
    ].includes(this.selectedRequestType);
  }

  isNewValueRequired(): boolean {
    return [
      ReportRequestType.NAME_CHANGE,
      ReportRequestType.EMAIL_CHANGE,
      ReportRequestType.PHONE_CHANGE,
      ReportRequestType.ADDRESS_CHANGE
    ].includes(this.selectedRequestType);
  }

  isExtendDaysRequired(): boolean {
    return this.selectedRequestType === ReportRequestType.EXTEND_DUE_DATE;
  }
}
