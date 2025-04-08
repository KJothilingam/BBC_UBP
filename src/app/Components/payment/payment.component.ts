import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { PaymentRequest } from '../../Interface/payment.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { AuthService } from '../../Services/auth.service';
import { PaymentService } from '../../Services/payment.service';
import { BillService } from '../../Services/bill.service';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule
]
})
export class PaymentComponent {
  paymentForm: FormGroup;
  isProcessing = false;
  bills: any[] = []; 
  paymentData: any = {};
  showModal = false;
  userName: string | null = 'N/A';
  designation: string | null = 'N/A';

  constructor(
    private fb: FormBuilder, 
    private paymentService: PaymentService, 
    private billService: BillService,
    private toastr: ToastrService,
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {
    this.paymentForm = this.fb.group({
      meterNumber: ['', Validators.required],
      billId: ['', Validators.required],
      amount: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)]],
      dueDate: [{ value: '', disabled: true }],
      paymentMethod: ['', Validators.required]
    });
  }

  closeModal() {
    this.showModal = false;
  }

// 🔹 Fetch unpaid bills
  fetchBills() {
    const meterNumber = this.paymentForm.get('meterNumber')?.value?.trim();

    console.log("Meter Number Entered:", meterNumber); 

    if (!meterNumber) {
      this.toastr.warning('Please enter a meter number.', 'Warning', this.getToastrConfig());
      return;
    }

    this.billService.getUnpaidBillsByMeter(meterNumber).subscribe({
      next: (data) => {
        console.log("Fetched Bills:", data); 

        if (!data || data.length === 0) { 
          this.bills = [];
          this.toastr.info('No pending bills.', 'Info', this.getToastrConfig());
          return;
        }

        this.bills = data; 
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastr.error('Failed to fetch bills. Try again later.', 'Error', this.getToastrConfig());
      }
    });
  }



  // 🔹 Auto-fill bill details when a bill is selected
  onBillSelect() {
    const selectedBillId = parseInt(this.paymentForm.get('billId')?.value, 10);
    const selectedBill = this.bills.find(bill => bill.billId === selectedBillId);

    if (selectedBill) {
      this.paymentForm.patchValue({
        amount: selectedBill.totalBillAmount,
        dueDate: new Date(selectedBill.dueDate).toISOString().split('T')[0] // Format YYYY-MM-DD
      });

      this.paymentData = {
        invoiceId: selectedBill.invoiceId,
        meterNumber: selectedBill.customer?.meterNumber ?? 'N/A',
        totalBillAmount: selectedBill.totalBillAmount,
        discountApplied: selectedBill.discountApplied,
        amountPaid: selectedBill.transaction?.amountPaid ?? 0,
        paymentMethod: selectedBill.transaction?.paymentMethod ?? 'N/A',
        paymentDate: selectedBill.transaction ? new Date(selectedBill.transaction.paymentDate).toISOString().split('T')[0] : 'N/A',
        customerName: selectedBill.customer?.name ?? 'Unknown',  
        customerEmail: selectedBill.customer?.email ?? 'N/A',
      };

      this.cd.detectChanges(); 
    }
  }


  processPayment() {
    if (this.paymentForm.invalid) {
      this.toastr.error('Please fill in all required fields.', 'Error', this.getToastrConfig());
      return;
    }
  
    this.isProcessing = true;
    this.paymentForm.disable();
  
    const paymentData: PaymentRequest = this.paymentForm.getRawValue();
  
    this.paymentService.processPayment(paymentData).subscribe({
      next: (response) => {
        if (response.success) {
        
          this.paymentData = {
            ...response,
            customerName: this.paymentData.customerName ?? 'N/A',
            customerEmail: this.paymentData.customerEmail ?? 'N/A'
          };
  
          this.toastr.success('Payment Successful!', 'Success', this.getToastrConfig());
          this.generatePDFReceipt(); 
          this.resetForm();
        } else {
         
          this.toastr.error(response.message || 'Payment Failed! Try again.', 'Error', this.getToastrConfig());
          this.isProcessing = false;
          this.paymentForm.enable();
        }
      },
      error: () => {
        this.toastr.error('Payment Failed! Try again.', 'Error', this.getToastrConfig());
        this.isProcessing = false;
        this.paymentForm.enable();
      }
    });
  }
  

  //  Reset form after payment
  private resetForm() {
    this.isProcessing = false;
    this.paymentForm.reset();
    this.paymentForm.enable();
    this.bills = [];
  }

  //  Generate PDF Receipt

  generatePDFReceipt() {
    if (!this.paymentData || Object.keys(this.paymentData).length === 0) {
      console.error("Payment data is missing!");
      return;
    }
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15; 
  
    //  **Header with Company Logo & Title**
    const logoUrl = 'https://cdn-icons-png.flaticon.com/512/1827/1827504.png'; 
    doc.setFillColor(0, 51, 153); 
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.addImage(logoUrl, 'PNG', 15, 5, 20, 20); 
    doc.text("Electricity Bill Payment Receipt", pageWidth / 2, y, { align: "center" });
  
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 30; 
  
    // Function to draw a table row with alternating colors
    function drawRow(label: string, value: string, startX: number, rowY: number, rowWidth: number, rowHeight: number, isAlternate: boolean, isBold: boolean = false, textColor: string = "black") {
      doc.setFillColor(isAlternate ? 230 : 245, isAlternate ? 245 : 255, 255); 
      doc.rect(startX, rowY, rowWidth, rowHeight, 'F'); 
      doc.setDrawColor(180, 180, 180); 
      doc.rect(startX, rowY, rowWidth, rowHeight); 
  
      if (isBold) doc.setFont("helvetica", "bold");
      else doc.setFont("helvetica", "normal");
  
      if (textColor === "red") doc.setTextColor(255, 0, 0); 
      else doc.setTextColor(0, 0, 0);
  
      doc.text(label, startX + 5, rowY + rowHeight / 2);
      doc.text(value, startX + rowWidth / 2 + 5, rowY + rowHeight / 2);
  
      doc.setFont("helvetica", "normal"); 
      doc.setTextColor(0, 0, 0); 
    }
  
    const tableX = 20;
    const tableWidth = pageWidth - 40;
    const rowHeight = 8;
  
    // 🔹 **Customer Details (with Icon)**
    const customerIcon = 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'; 
    doc.addImage(customerIcon, 'PNG', tableX, y - 2, 6, 6);
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 153);
    doc.text("Customer Details", tableX + 10, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 8;
  
    const customerDetails = [
      ["Customer Name", this.paymentData.customerName ?? "N/A"],
      ["Email", this.paymentData.customerEmail ?? "N/A"],
      ["Meter Number", this.paymentData.meterNumber ?? "N/A"],
      ["Billing Address", this.paymentData.billingAddress ?? "N/A"],
    ];
  
    customerDetails.forEach(([label, value], index) => {
      drawRow(label, value, tableX, y, tableWidth, rowHeight, index % 2 !== 0);
      y += rowHeight;
    });
  
    y += 10; 
  
    // 🔹 **Invoice & Payment Details (with Icon)**
    const invoiceIcon = 'https://cdn-icons-png.flaticon.com/512/166/166258.png'; // Invoice icon
    doc.addImage(invoiceIcon, 'PNG', tableX, y - 2, 6, 6);
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 153);
    doc.text("Invoice & Payment Details", tableX + 10, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 8;
  
    // ✅ Corrected Amount Paid Calculation
    const calculatedAmountPaid = (this.paymentData.totalBillAmount ?? 0) - (this.paymentData.discountApplied ?? 0);
  
    const invoiceDetails = [
      ["Invoice ID", this.paymentData.invoiceId ?? "N/A"],
      ["Unit Consumed", `${this.paymentData.unitConsumed ?? "0"} kWh`],
      ["Due Date", this.paymentData.dueDate ? new Date(this.paymentData.dueDate).toLocaleDateString() : "N/A"],
      ["Payment Date", this.paymentData.paymentDate ? new Date(this.paymentData.paymentDate).toLocaleDateString() : "N/A"],
      ["Bill Amount", `₹${this.paymentData.totalBillAmount ?? "0.00"}`],
      ["Previous Due", `₹${this.paymentData.previousDue ?? "0.00"}`],
      ["Late Fee", `₹${this.paymentData.lateFee ?? "0.00"}`],
      ["Discount", `₹${this.paymentData.discountApplied ?? "0.00"}`],
      ["GST", `₹${this.paymentData.gst ?? "0.00"}`],
      ["Net Payable", `₹${this.paymentData.netPayable ?? "0.00"}`],
      ["Amount Paid", `₹${calculatedAmountPaid.toFixed(2)}`], 
      ["Payment Method", this.paymentData.paymentMethod ?? "N/A"],
      ["Transaction ID", this.paymentData.transactionId ?? "N/A"],
    ];
  
    invoiceDetails.forEach(([label, value], index) => {
      const isAmountPaid = label === "Amount Paid";
      drawRow(label, value, tableX, y, tableWidth, rowHeight, index % 2 !== 0, isAmountPaid, isAmountPaid ? "red" : "black");
      y += rowHeight;
    });
  
    y += 10; 
  
    // 🔹 **Generate QR Code**
    const qrData = `Invoice ID: ${this.paymentData.invoiceId}
  Customer: ${this.paymentData.customerName}
  Meter No: ${this.paymentData.meterNumber}
  Amount Paid: ₹${calculatedAmountPaid.toFixed(2)}`;
  
    QRCode.toDataURL(qrData, { width: 100 }, (err, qrUrl) => {
      if (!err) {
        doc.addImage(qrUrl, 'PNG', pageWidth - 60, y, 40, 40);
        doc.text("Scan for Details", pageWidth - 60, y + 45);
      }
  
      // 🔹 **Footer**
      doc.setFillColor(0, 51, 153);
      doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("For any queries, contact: support@electricity.com", pageWidth / 2, doc.internal.pageSize.getHeight() - 12, { align: "center" });
      doc.text("Thank you for your payment!", pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: "center" });
  
      // 🔹 **Save PDF**
      doc.save(`receipt_${this.paymentData.invoiceId ?? "unknown"}.pdf`);
    });
  }
  
  







  // 🔹 Toastr Configuration
  private getToastrConfig() {
    return { timeOut: 3000, positionClass: 'toast-top-right' };
  }
}
