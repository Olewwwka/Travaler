import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { RoleEntity } from "src/Modules/RolePermissions/Entities/role.entity";
import { JoinTable } from "typeorm";
    
@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column({ unique: true })
    email?: string;

    @Column()
    name?: string;

    @Column()
    passwordHash?: string;

    @Column({ type: 'bytea', nullable: true })
    photo?: Buffer;

    @JoinTable()
    @ManyToMany(() => RoleEntity, (role) => role.users)
    roles?: RoleEntity[]; 
    
    @Column({ type: 'float', nullable: true })
    latitude: number | null;
  
    @Column({ type: 'float', nullable: true })
    longitude: number | null;
    constructor() {
    }
}