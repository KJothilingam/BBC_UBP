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
        path:'report',
        loadComponent :()=>import('./Components/reports/reports.component').then((c)=> c.ReportsComponent),
    },
];
