import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { PermissionEntity } from "./permission.entity";
import { UserEntity } from "src/Modules/Users/Entities/user.entity";
import { JoinTable } from "typeorm";

@Entity()
export class RoleEntity {
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column({ unique: true })
    name?: string;

    @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
    @JoinTable()
    permissions?: PermissionEntity[];
    
    @ManyToMany(() => UserEntity, (user) => user.roles)
    users?: UserEntity[]; 
}