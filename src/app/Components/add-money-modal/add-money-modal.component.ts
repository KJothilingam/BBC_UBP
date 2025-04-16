import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../Services/wallet.service';

@Component({
  selector: 'app-add-money-modal',
  templateUrl: './add-money-modal.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./add-money-modal.component.css']
})
export class AddMoneyModalComponent {
  addMoneyForm: FormGroup;
  showAmountInput = false;
  private correctPasskey : number = 0;


  constructor(
    public dialogRef: MatDialogRef<AddMoneyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { paymentMethod: string },
    private fb: FormBuilder,
    private toastr: ToastrService,
    private walletService: WalletService
  ) {
    this.addMoneyForm = this.fb.group({
      passkey: ['', [Validators.required, Validators.minLength(6)]],
      amount: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)]]
    });
    // Fetch the correct passkey on init
    this.walletService.getPasskey().subscribe({
      next: (passkey) => this.correctPasskey = passkey,
      error: () => this.toastr.error('Failed to load passkey from server')
    });
  }

  verifyPasskey() {
    const enteredPasskey = +this.addMoneyForm.value.passkey;
    if (enteredPasskey === this.correctPasskey) {
      this.showAmountInput = true;
      this.addMoneyForm.controls['amount'].enable();
      this.toastr.success('Passkey verified!');
    } else {
      console.log(`${enteredPasskey} != ${this.correctPasskey}`);
      this.toastr.error('Invalid Passkey');
    }
  }
  

  submit() {
    if (this.addMoneyForm.valid) {
      this.dialogRef.close({
        paymentMethod: this.data.paymentMethod,
        amount: this.addMoneyForm.value.amount
      });
    } else {
      this.toastr.error('Please fill in all the required fields.');
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  resetPasskey() {
    this.addMoneyForm.controls['passkey'].reset();
  }
}
