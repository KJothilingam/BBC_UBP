import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideToastr, ToastrModule } from 'ngx-toastr';
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptors/jwt.interceptor'; 
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(
      MatRadioModule,
      MatInputModule,
      MatCardModule,
      MatFormFieldModule,
      MatSelectModule,
      MatOptionModule,
      MatButtonModule
    ),
    importProvidersFrom(ToastrModule.forRoot({
      timeOut: 1000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      maxOpened: 1,
      autoDismiss: true,
      newestOnTop: true,
    })),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor]) 
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
