import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = "";
  otp: string = "";
  otpGenerated: boolean = false;
  storedOtp: string = "";

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  moveNext(event: any, index: number): void {
    const inputValue = event.target.value;
    if (inputValue.length === 1 && index < this.otpInputs.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  moveBack(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const inputs = this.otpInputs.toArray();
      if (index > 0) {
        inputs[index].nativeElement.value = '';  
        inputs[index - 1].nativeElement.focus();
      }
    }
  }

  autoFillOtp(otp: string) {
    const otpArray = otp.split('');
    const inputs = this.otpInputs.toArray();

    otpArray.forEach((digit, index) => {
      if (inputs[index]) {
        inputs[index].nativeElement.value = digit;
      }
    });

    if (inputs.length > 0) {
      inputs[inputs.length - 1].nativeElement.focus();
    }
  }

  generateOtp() {
    if (!this.email) {
      this.toastr.warning("⚠️ Please enter your email", "Warning!", { timeOut: 10000 });
      return;
    }

    this.authService.generateOtp(this.email).subscribe(
      response => {
        if (response.otp) {
          this.storedOtp = response.otp;

          const sanitizedMessage: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
            `✅ OTP Sent Successfully! <br><strong style="font-size: 18px;">Your OTP: ${response.otp}</strong>`
          );

          this.toastr.success(sanitizedMessage as string, "Success!", { timeOut: 10000, enableHtml: true });

          setTimeout(() => this.autoFillOtp(response.otp), 500);
        } else {
          this.toastr.success("✅ OTP Sent Successfully!", "Success!", { timeOut: 10000 });
        }
      },
      error => {
        let errorMessage = error.error?.message || "❌ Something went wrong!";
        this.toastr.error(errorMessage, "Error!", { timeOut: 10000 });
      }
    );
  }

  verifyOtp() {
    const enteredOtp = this.otpInputs.map(input => input.nativeElement.value).join('');

    if (enteredOtp.length !== 6) {
      this.toastr.warning("⚠️ Enter complete 6-digit OTP", "Warning!", { timeOut: 10000 });
      return;
    }

    this.authService.verifyOtp(this.email, enteredOtp).subscribe(
      response => {
        console.log("Server Response:", response);

        if (response?.customerId && response?.customerName) {
          localStorage.setItem('customerId', response.customerId.toString());
          localStorage.setItem('customerName', response.customerName);

          const sanitizedMessage: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
            `✅ OTP Verified!<br><strong>Welcome, ${response.customerName}!</strong>`
          );

          this.toastr.success(sanitizedMessage as string, "Success!", { timeOut: 20000, enableHtml: true });

          this.getUserDetails();
          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error("❌ Invalid Response from Server", "Error!", { timeOut: 10000 });
        }
      },
      error => {
        this.toastr.error(error.error?.message || "❌ Invalid OTP", "Error!", { timeOut: 10000 });
      }
    );
  }

  getUserDetails() {
    const customerId = localStorage.getItem('customerId');
    const customerName = localStorage.getItem('customerName');

    console.log(`Logged in Customer: ${customerName} (ID: ${customerId})`);
  }
}
