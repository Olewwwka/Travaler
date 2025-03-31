import { Routes } from '@angular/router';
import { MapComponent } from './Map/map.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './auth/auth.guard';
import { PlacesComponent } from './places/places.component';

export const routes: Routes = [
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'places', component: PlacesComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/map', pathMatch: 'full' },
];
