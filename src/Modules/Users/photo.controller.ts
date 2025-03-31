import { Controller, Get, Post, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Param, BadRequestException, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { PhotoService } from './photo.service';
import { Request, Response } from 'express';
import { UserEntity } from './Entities/user.entity';

interface RequestWithUser extends Request {
  user: UserEntity;
}

@Controller('users')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Get('photo')
  @UseGuards(JwtAuthGuard)
  async getPhoto(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      if (!req.user?.id) {
        console.error('User ID is missing in request');
        const defaultPhoto = await this.photoService.getDefaultPhoto();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(defaultPhoto);
      }

      const photo = await this.photoService.getPhoto(req.user.id);
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(photo);
    } catch (error) {
      console.error('Error in getPhoto controller:', error);
      const defaultPhoto = await this.photoService.getDefaultPhoto();
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(defaultPhoto);
    }
  }

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      console.log('File upload attempt:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        console.error('Invalid file type:', file.originalname);
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  async uploadPhoto(@UploadedFile() file: any, @Req() req: RequestWithUser) {
    try {
      console.log('Upload photo request received:', {
        userId: req.user?.id,
        fileExists: !!file,
        fileDetails: file ? {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        } : null
      });

      if (!req.user?.id) {
        console.error('User ID is missing in upload request');
        throw new NotFoundException('Пользователь не найден');
      }

      if (!file) {
        console.error('No file provided in request');
        throw new BadRequestException('Файл не был предоставлен');
      }

      const result = await this.photoService.uploadPhoto(req.user.id, file);
      console.log('Photo uploaded successfully');
      return result;
    } catch (error) {
      console.error('Error in uploadPhoto controller:', error);
      throw error;
    }
  }

  @Delete('delete-photo')
  @UseGuards(JwtAuthGuard)
  async deletePhoto(@Req() req: RequestWithUser, @Res() res: Response) {
    if (!req.user?.id) {
      throw new NotFoundException('Пользователь не найден');
    }
    const userId = req.user.id;
    const photo = await this.photoService.deletePhoto(userId);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(photo);
  }
} 