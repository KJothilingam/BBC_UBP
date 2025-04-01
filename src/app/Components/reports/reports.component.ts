import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { WalletService } from '../../Services/wallet.service';
import { AuthService } from '../../Services/auth.service';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  imports: [CommonModule,SidebarComponent]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  creditCardBalance: number = 0;
  debitCardBalance: number = 0;
  upiBalance: number = 0;
  walletBalance: number = 0;

  constructor(private walletService: WalletService, private authService: AuthService) {}

  ngOnInit() {
    const customerId = this.authService.getCustomerId();
    if (customerId) {
      this.walletService.getWalletBalance(customerId).subscribe(
        (wallet) => {
          this.creditCardBalance = wallet.creditCardBalance;
          this.debitCardBalance = wallet.debitCardBalance;
          this.upiBalance = wallet.upiBalance;
          this.walletBalance = wallet.walletBalance;
        },
        (error) => {
          console.error('Error fetching wallet balance:', error);
        }
      );
    }
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
