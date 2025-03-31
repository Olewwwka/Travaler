import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './Entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PhotoService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly defaultPhotoPath = path.join(this.uploadDir, 'default.png');

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    // Создаем директорию uploads, если она не существует
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Проверяем наличие дефолтного фото
    if (!fs.existsSync(this.defaultPhotoPath)) {
      const defaultPhotoBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(this.defaultPhotoPath, defaultPhotoBuffer);
    }
  }

  getDefaultPhoto(): Buffer {
    return fs.readFileSync(this.defaultPhotoPath);
  }

  private isDefaultPhoto(photoBuffer: Buffer): boolean {
    const defaultPhotoBuffer = this.getDefaultPhoto();
    return Buffer.compare(photoBuffer, defaultPhotoBuffer) === 0;
  }

  async uploadPhoto(userId: string, file: any): Promise<Buffer> {
    try {
      console.log('Starting photo upload process:', {
        userId,
        fileDetails: {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }
      });

      if (!file.buffer) {
        console.error('File buffer is missing');
        throw new BadRequestException('Файл поврежден или не содержит данных');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        console.error(`User not found with ID: ${userId}`);
        throw new NotFoundException('Пользователь не найден');
      }

      user.photo = file.buffer;
      await this.userRepository.save(user);
      console.log('Photo saved to database');

      return file.buffer;
    } catch (error) {
      console.error('Error uploading photo:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка загрузки фото: ' + error.message);
    }
  }

  async deletePhoto(userId: string): Promise<Buffer> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const defaultPhoto = this.getDefaultPhoto();
      user.photo = defaultPhoto;
      await this.userRepository.save(user);

      return defaultPhoto;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new BadRequestException('Ошибка удаления фото');
    }
  }

  async getPhoto(userId: string): Promise<Buffer> {
    try {
      if (!userId) {
        console.error('User ID is missing');
        return this.getDefaultPhoto();
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        console.error(`User not found with ID: ${userId}`);
        return this.getDefaultPhoto();
      }

      if (!user.photo) {
        console.log(`No photo found for user: ${userId}, returning default photo`);
        return this.getDefaultPhoto();
      }

      return user.photo;
    } catch (error) {
      console.error('Error getting photo:', error);
      return this.getDefaultPhoto();
    }
  }
} 