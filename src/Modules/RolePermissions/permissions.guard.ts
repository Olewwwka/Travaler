import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { PERMISSIONS_KEY } from './decorators/permissions.decorator';
  
  @Injectable()
  export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (!requiredPermissions) {
        return true;
      }
  
      const { user } = context.switchToHttp().getRequest();
      if (!user || !user.roles) {
        return false;
      }
  
      const userPermissions = user.roles.flatMap(role => role.permissions);
      const hasPermissions = requiredPermissions.every(permission => 
        userPermissions.some(userPermission => userPermission.name === permission)
      );
      
      if (!hasPermissions) {
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }
  
      return true;
    }
  }