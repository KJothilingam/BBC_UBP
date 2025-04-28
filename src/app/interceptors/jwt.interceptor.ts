// jwt.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../Services/auth.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('jwtToken');

  const clonedReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // if (error.status === 401 || error.status === 403) {
      //   const message = error.error?.error || 'Session expired. Please login again.';
      //   alert(message);
      //   authService.logout();
      //   router.navigate(['/login']);
      // }
      return throwError(() => error);
    })
  );
};
