import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionService } from './Modules/RolePermissions/role.permission.service';
import { ConfigModule } from '@nestjs/config';
import { PermissionEntity } from './Modules/RolePermissions/Entities/permission.entity';
import { RoleEntity } from './Modules/RolePermissions/Entities/role.entity';
import { AuthModule } from './Modules/Auth/auth.module';
import { PointsModule } from './Modules/Points/points.module';
import { PointsController } from './Modules/Points/points.controller';
import { PointEntity } from './Modules/Points/points.entity';
import { UsersModule } from './Modules/Users/users.module';
import { RouteModule } from './Modules/openRoutesAPI/openRoute.module';
import { MulterModule } from '@nestjs/platform-express';
import { FavoritePointsController } from './Modules/Points/favorite-points.controller';
import { ReviewsModule } from './Modules/Reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', 
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || "7777", 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], 
      synchronize: true, 
    }),
    TypeOrmModule.forFeature([PermissionEntity, RoleEntity]),
    TypeOrmModule.forFeature([PointEntity]), 
    AuthModule,
    PointsModule,
    UsersModule,
    RouteModule,
    ReviewsModule,
    MulterModule.register({
      dest: './uploads',
    })
  ],
  controllers: [AppController, PointsController, FavoritePointsController],
  providers: [AppService, RolePermissionService],
})
export class AppModule {}