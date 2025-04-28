import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportRequestService } from '../../Services/report-request.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../Services/auth.service';
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
  selectedRequestType: ReportRequestType = ReportRequestType.READING_UNIT_CONSUMED_FAULT; // Default enum value
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
      next: (res) => {
        // Ensure the correct mapping of request type to enum
        this.customerRequests = res.map((request: any) => ({
          ...request,
          requestType: ReportRequestType[request.requestType as keyof typeof ReportRequestType] as ReportRequestType,
          status: request.status as RequestStatus, // Correctly typing the status
        }));
      },
      error: (err) => console.error('Error fetching requests:', err),
    });
  }

  // submitRequest(): void {
  //   if (this.isBillIdRequired() && !this.newRequest.billId) {
  //     alert('Bill ID is required.');
  //     return;
  //   }

  //   if (this.isNewValueRequired() && !this.newRequest.newValue) {
  //     alert('New value is required.');
  //     return;
  //   }

  //   if (this.isExtendDaysRequired() && !this.newRequest.extendDays) {
  //     alert('Extend days is required.');
  //     return;
  //   }

  //   // Ensure the requestType is properly assigned from the enum
  //   this.newRequest.requestType = this.selectedRequestType;
  //   this.newRequest.customerId = this.customerId;

  //   this.reportService.submitRequest(this.newRequest).subscribe({
  //     next: (res) => {
  //       this.customerRequests.push(res); // Add new request to the list
  //       this.resetForm();
  //     },
  //     error: (err) => console.error('Error submitting request:', err),
  //   });
  // }
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
          requestType: ReportRequestType[res.requestType as keyof typeof ReportRequestType], // Proper mapping
          status: res.status as RequestStatus,  // Typing status correctly
        };
        this.customerRequests.push(mappedRequest);
        this.resetForm();
      },
      error: (err) => console.error('Error submitting request:', err),
    });
  }
  
  resetForm(): void {
    this.newRequest = this.initializeRequest();  // Reset form
    this.selectedRequestType = ReportRequestType.READING_UNIT_CONSUMED_FAULT; // Default value
  }

  initializeRequest(): CustomerRequest {
    return {
      requestType: ReportRequestType.READING_UNIT_CONSUMED_FAULT, // Default enum value
      status: 'IN_PROCESS',  // Default status
      billId: undefined,
      newValue: '',
      extendDays: undefined,
      details: '',
      customerId: this.customerId,
      requestDate: ''
    };
  }

  getStatusClass(status: RequestStatus): string {
    // Compare status with the string values
    switch (status) {
      case 'SUCCESS': return 'status-success';
      case 'IN_PROCESS': return 'status-inprocess';
      case 'COMPLETED': return 'status-completed';
      case 'DECLINED': return 'status-declined';
      default: return '';
    }
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


