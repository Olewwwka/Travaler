import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './Entities/user.entity';
import { RoleEntity } from '../RolePermissions/Entities/role.entity';
import * as bcrypt from 'bcrypt';
import { UpdateCoordinatesDto } from '../dto/userCords.dto';
import * as fs from 'fs';
import * as path from 'path';

interface CreateUserData extends Partial<UserEntity> {
  password: string;
}

@Injectable()
export class UsersService {
  private readonly defaultPhotoPath = path.join(process.cwd(), 'uploads', 'default.png');

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {
    // Проверяем наличие дефолтного фото
    if (!fs.existsSync(this.defaultPhotoPath)) {
      const defaultPhotoBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(this.defaultPhotoPath, defaultPhotoBuffer);
    }
  }

  private getDefaultPhoto(): Buffer {
    return fs.readFileSync(this.defaultPhotoPath);
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOneByEmailWithPermissions(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ 
        where: { email }, 
        relations: ['roles', 'roles.permissions'] 
    });
  }

  async create(user: CreateUserData): Promise<UserEntity> {
    const salt = await bcrypt.genSalt(10);
    const { password, ...userData } = user;
    userData.passwordHash = await bcrypt.hash(password, salt);
    
    const adminRole = await this.roleRepository.findOne({
        where: { name: 'Admin' },
        relations: ['permissions'], 
      });
  
    userData.roles = adminRole ? [adminRole] : [];
    
    // Устанавливаем дефолтное фото
    userData.photo = this.getDefaultPhoto();
    
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async assignRole(userId: string, roleName: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['roles'] });
    const role = await this.roleRepository.findOne({ where: { name: roleName } });

    if (!user || !role) {
      throw new Error('User or Role not found');
    }

    user.roles = [...(user.roles || []), role];
    return this.userRepository.save(user);
  }

  async updateCoordinates(
      userId: string,
      updateCoordinatesDto: UpdateCoordinatesDto,
    ): Promise<UserEntity> {
      const user = await this.userRepository.findOne({ where: { id: userId } });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      user.latitude = updateCoordinatesDto.latitude;
      user.longitude = updateCoordinatesDto.longitude;
  
      return this.userRepository.save(user);
    }

    async getUserCoordinates(userId: string): Promise<UpdateCoordinatesDto> {
      const user = await this.userRepository.findOne({ where: { id: userId } });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      return {
        latitude: user.latitude,
        longitude: user.longitude,
      };
    }

    async update(id: string, updateData: { name?: string; email?: string }) {
      const user = await this.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (updateData.email) {
        const existingUser = await this.findOneByEmail(updateData.email);
        if (existingUser && existingUser.id !== id) {
          throw new BadRequestException('Email already exists');
        }
        user.email = updateData.email;
      }

      if (updateData.name) {
        user.name = updateData.name;
      }

      return this.userRepository.save(user);
    }

    async updatePassword(id: string, newPassword: string) {
      const user = await this.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const salt = await bcrypt.genSalt();
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      return this.userRepository.save(user);
    }
}