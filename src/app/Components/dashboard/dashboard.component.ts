import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { WalletService } from '../../Services/wallet.service';
import { AuthService } from '../../Services/auth.service';
import { AddMoneyModalComponent } from '../add-money-modal/add-money-modal.component';
import { Chart, registerables } from 'chart.js';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { BillService } from '../../Services/bill.service';
import { RecentPaymentComponent } from "../recent-payment/recent-payment.component";

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, SidebarComponent, RecentPaymentComponent],
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  // creditCardBalance = 0;
  // debitCardBalance = 0;
  // upiBalance = 0;
  walletBalance = 0;
  customerId!: number;

  constructor(
    private billService: BillService,
    private dialog: MatDialog,
    private walletService: WalletService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.customerId = this.authService.getCustomerId();
    this.fetchWalletBalance();
  }

  ngAfterViewInit() {
    if (this.customerId) {
      this.fetchChartData();
    }
  }

  fetchChartData() {
    this.billService.getMonthlyStats(this.customerId).subscribe((data) => {
      const months = data.months.map((m: number) => this.getMonthName(m));
      const payments = data.payments;
      const units = data.units;

      // Bar Chart (Monthly Payments)
      new Chart("barChart", {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Total Amount',
            data: payments,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2
          }]
        }
      });

      // Line Chart (Monthly Units Consumed)
      new Chart("lineChart", {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Unit Consumed',
            data: units,
            borderColor: '#4fd1c5',
            backgroundColor: 'rgba(79, 209, 197, 0.2)',
            borderWidth: 2
          }]
        }
      });
    });
  }

  getMonthName(month: number): string {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[month - 1];
  }

  // Fetch current wallet balance
  fetchWalletBalance() {
    this.walletService.getWalletBalance(this.customerId).subscribe(
      (wallet) => {
        // this.creditCardBalance = wallet.creditCardBalance;
        // this.debitCardBalance = wallet.debitCardBalance;
        // this.upiBalance = wallet.upiBalance;
        this.walletBalance = wallet.walletBalance;
      },
      (error) => console.error('Error fetching wallet balance:', error)
    );
  }

  // Open add money dialog and handle submission
  openAddMoneyDialog(paymentMethod: string) {
    const dialogRef = this.dialog.open(AddMoneyModalComponent, {
      width: '400px',
      data: { paymentMethod }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Request sent:', {
          customerId: this.customerId,
          amount: result.amount,
          paymentMethod: result.paymentMethod
        });

        this.addMoney(result.amount, result.paymentMethod);
      }
    });
  }

  // Add money to the wallet
  addMoney(amount: number, paymentMethod: string) {
    if (amount <= 0) {
      this.toastr.error('Enter a valid amount');
      return;
    }

    // Make the API call to add money
    this.walletService.addMoney(this.customerId, amount, paymentMethod).subscribe(
      (response) => {
        if (response && response.message) {
          this.toastr.success(response.message);
          this.fetchWalletBalance();
        }
      },
      (error) => {
        if (error.error && error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Failed to add money');
        }
      }
    );
  }

  
}
