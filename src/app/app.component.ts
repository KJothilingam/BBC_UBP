import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BBC_UBP';
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'jwtToken' && event.newValue === null) {
        this.authService.logout(); // Optional extra cleanup
        this.router.navigate(['/login']);
      }
    });
  }
}
