import { CommonModule, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import jsPDF from 'jspdf';

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
  
    this.http.get<any[]>(`http://localhost:8080/payment-records/customer?customerId=${customerId}`)
      .subscribe(data => {
        this.payments = data
          .map(payment => ({
            ...payment,
            transactionId: payment.transactionId, // Ensure Transaction ID is used
            paymentDateFormatted: this.convertToDate(payment.paymentDate),
            dueDateFormatted: this.convertToDate(payment.dueDate)
          }))
          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()); // 🔹 Sorting by `paymentDate` (Latest First)
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
  // payments: any[] = [];
  generatePDF(transactionId: string) {
    const payment = this.payments.find(p => p.transactionId === transactionId);
    if (payment) {
        this.createPDF(payment);
    } else {
        console.error('Payment not found for transaction ID:', transactionId);
    }
}


  // Function to generate PDF
  private createPDF(payment: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // **Company Logo & Header**
    const logoUrl = 'https://cdn-icons-png.flaticon.com/512/1827/1827504.png';  // Add your logo URL
    doc.setFillColor(0, 102, 204);  // Header color (Dark Blue)
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.addImage(logoUrl, 'PNG', 15, 5, 20, 20);
    doc.text("Payment Receipt", pageWidth / 2, 15, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 35;

    // Function to Draw Table Row
    const drawRow = (label: string, value: string, rowY: number, isBold: boolean = false, r: number = 240, g: number = 240, b: number = 240) => {
      const rowX = 20;
      const rowWidth = pageWidth - 40;
      const rowHeight = 10;
      const labelX = rowX + 5;
      const valueX = rowX + rowWidth / 2 + 5;

      doc.setFillColor(r, g, b);  // Background color
      doc.rect(rowX, rowY, rowWidth, rowHeight, 'F');
      doc.setDrawColor(180, 180, 180);  // Border color
      doc.rect(rowX, rowY, rowWidth, rowHeight);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.text(label, labelX, rowY + rowHeight / 2 + 2);
      doc.text(value, valueX, rowY + rowHeight / 2 + 2);
    };

    // Invoice Details Section
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Invoice Details", 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 10;

    drawRow("Transaction ID", payment.transactionId ?? "N/A", y, true, 220, 220, 250);  // Light Blue
    y += 12;
    drawRow("Meter Number", payment.meterNumber ?? "N/A", y, false, 250, 250, 250);
    y += 12;
    drawRow("Unit Consumed", `${payment.unitConsumed} kWh`, y, false, 250, 250, 250);
    y += 12;
    drawRow("Billing Month", payment.billingMonth ?? "N/A", y, false, 250, 250, 250);
    y += 12;
    drawRow("Due Date", payment.dueDateFormatted ?? "N/A", y, false, 250, 250, 250);
    y += 12;

    // Billing Details Section
    drawRow("Total Bill Amount", `₹${payment.totalBillAmount}`, y, true, 255, 235, 205);  // Light Yellow
    y += 12;
    drawRow("Discount Applied", `₹${payment.discountApplied}`, y, false, 240, 248, 255);  // Light Cyan
    y += 12;
    drawRow("Final Amount Paid", `₹${payment.finalAmountPaid}`, y, false, 255, 250, 250);
    y += 12;

    // Footer
    doc.setFillColor(0, 102, 204);
    doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Thank you for your payment!", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

    // Save the PDF
    doc.save(`Receipt_${payment.transactionId}.pdf`);
  }
}
