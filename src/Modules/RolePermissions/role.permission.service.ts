import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PermissionEntity } from './Entities/permission.entity';
import { RoleEntity } from 'src/Modules/RolePermissions/Entities/role.entity';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(PermissionEntity)
    private permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async initializeRolesAndPermissions() {
    const permissions = [
      { name: 'CREATE' },
      { name: 'READ' },
      { name: 'UPDATE' },
      { name: 'DELETE' },
    ];

    const roles = [
      { name: 'Admin', permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'] },
      { name: 'User', permissions: ['READ'] },
    ];

    try {
      for (const permission of permissions) {
        const existingPermission = await this.permissionRepository.findOneBy({
          name: permission.name,
        });
        if (!existingPermission) {
          await this.permissionRepository.save(permission);
        }
      }

      for (const role of roles) {
        const rolePermissions = await this.permissionRepository.findBy({
          name: In(role.permissions),
        });

        const existingRole = await this.roleRepository.findOneBy({
          name: role.name,
        });
        if (!existingRole) {
          const newRole = this.roleRepository.create({
            name: role.name,
            permissions: rolePermissions,
          });
          await this.roleRepository.save(newRole);
        }
      }
      console.log('Roles and permissions initialized successfully.');
    } catch (error) {
      console.error('Error initializing roles and permissions:', error);
    }
  }
}