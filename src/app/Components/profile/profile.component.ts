import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, CommonModule, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  customer: any;
  showModal: boolean = false;

  constructor(private toastr: ToastrService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCustomerDetails().subscribe(
      (data) => {
        this.customer = data;
      },
      (error) => {
        console.error('Error fetching customer details:', error);
      }
    );
  }

 

  
}
