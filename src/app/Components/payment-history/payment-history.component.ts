import { CommonModule, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-payment-history',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.css'
})
export class PaymentHistoryComponent implements OnInit {
  
  payments: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const customerId = this.getCustomerId(); // Get the logged-in user's customer ID
    this.http.get<any[]>(`http://localhost:8080/payment-records/customer?customerId=${customerId}`).subscribe(data => {
      this.payments = data.map(payment => ({
        ...payment,
        transactionId: payment.transactionId, // Ensure Transaction ID is used
        paymentDateFormatted: this.convertToDate(payment.paymentDate),
        dueDateFormatted: this.convertToDate(payment.dueDate)
      }));
    });
  }
  
  

  private convertToDate(dateValue: any): string {
    if (!dateValue) return 'N/A'; 

    let dateObj;
    if (typeof dateValue === 'number') {
      dateObj = new Date(dateValue);
    } else if (typeof dateValue === 'string') {
      dateObj = new Date(dateValue.replace(' ', 'T'));
    } else {
      return 'Invalid Date';
    }

    return formatDate(dateObj, 'dd.MMM.yyyy', 'en-US');
  }

  
  private getCustomerId(): number {
    return Number(localStorage.getItem('customerId')) || 0; // Retrieve customer ID from localStorage
  }
}
