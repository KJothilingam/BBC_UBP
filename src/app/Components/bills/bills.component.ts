import { Component, OnInit } from '@angular/core';
import { BillService } from '../../Services/bill.service';
import { AuthService } from '../../Services/auth.service';
import { jsPDF } from 'jspdf';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [RouterLink, CommonModule, SidebarComponent, FormsModule],
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
        this.bills = response.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // 🔹 Sort by `createdAt` (latest first)
        this.filteredBills = [...this.bills];
        console.log(this.bills);
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
      case 'EXCEPTION':
        return 'status-exception';
      default:
        return '';
    }
  }

  generatePDF(bill: any) {
    if (!bill) {
        console.error(" Error: Invoice data is missing!");
        return;
    }

    console.log(" Generating PDF for:", bill);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    const logoUrl = 'https://cdn-icons-png.flaticon.com/512/1827/1827504.png'; 
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
        doc.setFillColor(0, 102, 204); 
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.addImage(img, 'PNG', 15, 5, 20, 20);
        doc.text("Electricity Bill Invoice", pageWidth / 2, 15, { align: "center" });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        y += 35;

        function drawRow(label: string, value: string, rowY: number, isBold: boolean = false, r: number = 240, g: number = 240, b: number = 240) {
            const rowX = 20;
            const rowWidth = pageWidth - 40;
            const rowHeight = 10;
            const labelX = rowX + 5;
            const valueX = rowX + rowWidth / 2 + 5;

            doc.setFillColor(r, g, b);  
            doc.rect(rowX, rowY, rowWidth, rowHeight, 'F');
            doc.setDrawColor(180, 180, 180); 
            doc.rect(rowX, rowY, rowWidth, rowHeight);

            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.text(label, labelX, rowY + rowHeight / 2 + 2);
            doc.text(value, valueX, rowY + rowHeight / 2 + 2);
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.text("Invoice Details", 20, y);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        y += 10;

        drawRow("Invoice ID", bill.invoiceId ?? "N/A", y, true, 220, 220, 250); 
        y += 12;
        drawRow("Issue Date", new Date(bill.createdAt).toLocaleDateString() ?? "N/A", y, false, 250, 250, 250);
        y += 12;
        drawRow("Due Date", new Date(bill.dueDate).toLocaleDateString() ?? "N/A", y, false, 250, 250, 250);
        y += 12;

        let statusColor: number[] = [255, 193, 7]; 
        if (bill.paymentStatus === "PAID") {
            statusColor = [40, 167, 69]; 
        } else if (bill.paymentStatus === "OVERDUE") {
            statusColor = [220, 53, 69]; 
        }

        drawRow("Payment Status", bill.paymentStatus ?? "N/A", y, true, statusColor[0], statusColor[1], statusColor[2]);
        y += 20;

        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.text("Customer Details", 20, y);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        y += 10;

        drawRow("Customer Name", bill.customer?.name ?? "N/A", y, true, 240, 248, 255); 
        y += 12;
        drawRow("Address", bill.customer?.address ?? "N/A", y, false, 255, 250, 250);
        y += 12;
        drawRow("Phone", bill.customer?.phoneNumber ?? "N/A", y, false, 255, 250, 250);
        y += 12;
        drawRow("Email", bill.customer?.email ?? "N/A", y, false, 255, 250, 250);
        y += 20;

        
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.text("Billing Details", 20, y);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        y += 10;

        drawRow("Units Consumed", `${bill.unitConsumed} kWh`, y, false, 224, 255, 255);
        y += 12;
        drawRow("Amount", `Rs.${bill.totalBillAmount}`, y, true, 255, 235, 205); 
        y += 20;

        doc.setFillColor(0, 102, 204);
        doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("Thank you for your payment!", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

        
        doc.save(`Invoice_${bill.invoiceId}.pdf`);
    };

   
    img.onerror = () => {
        console.error(" Error: Failed to load logo image.");
        doc.save(`Invoice_${bill.invoiceId}.pdf`);
    };
}

downloadPdf(): void {
  const doc = new jsPDF();

  const title = 'Invoice Records';
  doc.setFontSize(18);
  doc.text(title, 14, 15);

  const headers = [['Invoice ID', 'Customer Name', 'Amount (Rs.)', 'Issue Date', 'Payment Status']];

  const dataSource = this.selectedStatus ? this.filteredBills : this.bills;

  const data = dataSource.map(bill => [
    bill.invoiceId ?? 'N/A',
    bill.customer?.name ?? 'N/A',
    bill.totalBillAmount ?? 'N/A',
    new Date(bill.createdAt).toLocaleDateString() ?? 'N/A',
    bill.paymentStatus ?? 'N/A'
  ]);

  autoTable(doc, {
    startY: 25,
    head: headers,
    body: data,
    theme: 'striped',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    margin: { top: 25 }
  });

  doc.save('invoice-records.pdf');
}


searchTerm: string = '';  //  Holds the search input

searchBills() {
  const term = this.searchTerm.toLowerCase().trim();

  this.filteredBills = this.bills.filter(bill => {
    return (
      bill.billId.toString().toLowerCase().includes(term) ||
      bill.customer_id?.toString().toLowerCase().includes(term) ||
      bill.meterNumber?.toLowerCase().includes(term)
    );
  });

  // Reapply the status filter too, if it's selected
  if (this.selectedStatus) {
    this.filteredBills = this.filteredBills.filter(
      bill => bill.paymentStatus === this.selectedStatus
    );
  }
}

}
