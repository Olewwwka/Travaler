import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { RoleEntity } from "./role.entity";
import { UserEntity } from "src/Modules/Users/Entities/user.entity";
import { JoinTable } from "typeorm";

@Entity()
export class PermissionEntity {
    @PrimaryGeneratedColumn("uuid")
    id?: string = "";

    @Column({ unique: true })
    name?: string = "";

    @ManyToMany(() => RoleEntity, (role) => role.permissions)
    roles?: RoleEntity[];
}
