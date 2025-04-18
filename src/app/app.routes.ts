import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
export const routes: Routes = [

    {
        path: '',
        loadComponent: () =>
          import('./Components/startup-redirect/startup-redirect.component').then((c) => c.StartupRedirectComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./Components/login/login.component').then((c) => c.LoginComponent),
      },
    {
        path:'dashboard',
        loadComponent :()=>import('./Components/dashboard/dashboard.component').then((c)=> c.DashboardComponent),
        canActivate: [AuthGuard]
    },
    
    {
        path:'bills',
        loadComponent :()=>import('./Components/bills/bills.component').then((c)=> c.BillsComponent),
        canActivate: [AuthGuard]
    },
    {
        path:'payment',
        loadComponent :()=>import('./Components/payment/payment.component').then((c)=> c.PaymentComponent),
        canActivate: [AuthGuard]
    },
    {
        path:'paymenthistory',
        loadComponent :()=>import('./Components/payment-history/payment-history.component').then((c)=> c.PaymentHistoryComponent),
        canActivate: [AuthGuard]
    },
   
    {
        path:'profile',
        loadComponent :()=>import('./Components/profile/profile.component').then((c)=> c.ProfileComponent),
        canActivate: [AuthGuard]
    },
    {
        path:'report',
        loadComponent :()=>import('./Components/report/report.component').then((c)=> c.ReportComponent),
        canActivate: [AuthGuard]
    },
   
];
