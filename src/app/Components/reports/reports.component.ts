import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SidebarComponent } from "../sidebar/sidebar.component";

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  imports: [SidebarComponent]
})
export class ReportsComponent implements AfterViewInit {
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
