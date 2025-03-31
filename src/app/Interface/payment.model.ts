// payment.model.ts
export interface PaymentRequest {
    billId: number;
    amount: number;
    paymentMethod: string;
    meterNumber: string;
  }
  
  export interface PaymentResponse {
    success: boolean;
    message: string;
    invoiceId: string;
    meterNumber: string;
    unitConsumed: number;
    dueDate: number;
    totalBillAmount: number;
    amountPaid: number;
    discountApplied: number;
    finalAmountPaid: number;
    paymentMethod: string;
    paymentDate: number;
    billingMonth: string;
    transactionId: string;
  }
  