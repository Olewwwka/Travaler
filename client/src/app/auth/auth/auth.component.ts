import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [
    CommonModule,
    LoginComponent,
    RegisterComponent,
    MatButtonModule
  ]
})
export class AuthComponent {
  showLogin: boolean = true; 

  toggleForm() {
    this.showLogin = !this.showLogin;
  }
}
