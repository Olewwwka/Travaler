import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './Entities/user.entity';
import { RoleEntity } from '../RolePermissions/Entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService,], 
})
export class UsersModule {}