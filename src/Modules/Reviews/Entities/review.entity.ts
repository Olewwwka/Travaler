import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { PointEntity } from '../../Points/points.entity';

@Entity('reviews')
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  rating: number;

  @Column()
  author: string;

  @Column({ nullable: true })
  authorPhoto: string;

  @ManyToOne(() => PointEntity, point => point.reviews)
  point: PointEntity;

  @CreateDateColumn()
  createdAt: Date;
} 