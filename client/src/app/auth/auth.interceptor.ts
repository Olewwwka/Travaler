import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { HttpInterceptorFn } from "@angular/common/http";

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: token 
      }
    });
  }

  return next(req);
};