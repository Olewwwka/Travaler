import { Entity, PrimaryGeneratedColumn, Column, Double, OneToMany } from 'typeorm';
import { ReviewEntity } from '../Reviews/Entities/review.entity';

@Entity()
export class PointEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('double precision')
  latitude: Double;

  @Column('double precision')
  longitude: Double;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  imageUrl: BinaryType;

  @OneToMany(() => ReviewEntity, review => review.point)
  reviews: ReviewEntity[];
}
