import { Injectable } from '@nestjs/common';
import { RolePermissionService } from './Modules/RolePermissions/role.permission.service';
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  async onModuleInit() {
    await this.rolePermissionService.initializeRolesAndPermissions();
  }
}
