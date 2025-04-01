import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path:'',
        loadComponent :()=>import('./Components/login/login.component').then((c)=> c.LoginComponent),
    },
    {
        path:'dashboard',
        loadComponent :()=>import('./Components/dashboard/dashboard.component').then((c)=> c.DashboardComponent),
    },
    
    {
        path:'bills',
        loadComponent :()=>import('./Components/bills/bills.component').then((c)=> c.BillsComponent),
    },
    {
        path:'payment',
        loadComponent :()=>import('./Components/payment/payment.component').then((c)=> c.PaymentComponent),
    },
   
];
