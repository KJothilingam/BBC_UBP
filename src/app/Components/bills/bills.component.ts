import { Component, OnInit } from '@angular/core';
import { BillService } from '../../Services/bill.service';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaymentHistoryComponent } from "../payment-history/payment-history.component";

@Component({
  selector: 'app-bills',
  standalone: true, // Add this if using standalone components
  imports: [RouterLink, CommonModule, SidebarComponent, FormsModule, PaymentHistoryComponent], // Import CommonModule for ngClass
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent implements OnInit {
  customerId: string = '';
  customerName: string = '';
  bills: any[] = [];
  filteredBills: any[] = [];
  selectedStatus: string = '';

  constructor(private billService: BillService, private authService: AuthService) {}

  ngOnInit() {
    this.loadCustomerData();
  }

  loadCustomerData() {
    this.customerId = localStorage.getItem('customerId') || '';
    this.customerName = localStorage.getItem('customerName') || '';

    if (this.customerId) {
      this.fetchBills();
    }
  }

  fetchBills() {
    this.billService.getBillsByCustomerId(this.customerId).subscribe(
      (response) => {
        this.bills = response;
        this.filteredBills = [...this.bills];
      },
      (error) => {
        console.error('Error fetching bills:', error);
      }
    );
  }

  filterBills() {
    if (!this.selectedStatus) {
      this.filteredBills = [...this.bills];
    } else {
      this.filteredBills = this.bills.filter((bill) => bill.paymentStatus === this.selectedStatus);
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'PAID':
        return 'status-paid';
      case 'OVERDUE':
        return 'status-overdue';
      default:
        return '';
    }
  }
}
