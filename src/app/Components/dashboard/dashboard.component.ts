import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { WalletService } from '../../Services/wallet.service';
import { AuthService } from '../../Services/auth.service';
import { AddMoneyModalComponent } from '../add-money-modal/add-money-modal.component';
import { Chart, registerables } from 'chart.js';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, SidebarComponent],
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  creditCardBalance = 0;
  debitCardBalance = 0;
  upiBalance = 0;
  walletBalance = 0;
  customerId!: number;

  constructor(
    private dialog: MatDialog,
    private walletService: WalletService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.customerId = this.authService.getCustomerId();
    if (this.customerId) {
      this.fetchWalletBalance();
    }
  }

  // Fetch current wallet balance
  fetchWalletBalance() {
    this.walletService.getWalletBalance(this.customerId).subscribe(
      (wallet) => {
        this.creditCardBalance = wallet.creditCardBalance;
        this.debitCardBalance = wallet.debitCardBalance;
        this.upiBalance = wallet.upiBalance;
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
        // Log the request being sent to the backend
        console.log('Request sent:', {
          customerId: this.customerId,
          amount: result.amount,
          paymentMethod: result.paymentMethod
        });

        // Call the add money function
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
          this.fetchWalletBalance(); // Refresh wallet balance after adding money
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

  ngAfterViewInit() {
    new Chart("barChart", {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'Active Users',
          data: [200, 450, 300, 500, 700],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2
        }]
      }
    });

    new Chart("lineChart", {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'Sales',
          data: [150, 300, 250, 400, 600],
          borderColor: '#4fd1c5',
          backgroundColor: 'rgba(79, 209, 197, 0.2)',
          borderWidth: 2
        }]
      }
    });
  }
}
