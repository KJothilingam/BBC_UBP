import { Component, NgZone, OnInit } from '@angular/core';
import { DashboardService } from '../../Services/dashboard.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-recent-payment',
  imports: [CommonModule],
  templateUrl: './recent-payment.component.html',
  styleUrl: './recent-payment.component.css'
})

export class RecentPaymentComponent implements OnInit {
  payments: any[] = [];
  meterNumber: string = ''; // ✅ Store meter number

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadCustomerDetails(); // ✅ Fetch meter number first
  }

  loadCustomerDetails() {
    this.authService.getCustomerDetails().subscribe({
      next: (customer) => {
        console.log("Customer details:", customer);
        this.meterNumber = customer.meterNumber; // ✅ Get meterNumber from customer details
        if (this.meterNumber) {
          this.loadPayments(); // ✅ Fetch payments after getting meterNumber
        }
      },
      error: (error) => {
        console.error("Error fetching customer details:", error);
      }
    });
  }

  loadPayments() {
    this.dashboardService.getLatestPaymentsByCustomer(this.meterNumber).subscribe({
      next: (data) => {
        console.log("Payments fetched:", data);
        this.payments = data.map(payment => ({
          ...payment,
          paymentDate: new Date(payment.paymentDate) // Convert timestamp to Date
        }));
      },
      error: (error) => {
        console.error("Error fetching payments:", error);
      }
    });
  }
}
