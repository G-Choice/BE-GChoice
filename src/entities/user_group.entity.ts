import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { Group } from "./group.entity";
import { PositionGroupEnum } from "src/common/enum/enums";

@Entity('user_group')
export class User_group {

  @PrimaryGeneratedColumn()
  id: number;
  @PrimaryColumn()
  group_id: number;

  @PrimaryColumn()
  user_id: number;

  @Column({default:null})
  role: string;

  @ManyToOne(
    () => User,
    user => user.user_groups,

    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'}
  )
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  users: User[];

  @ManyToOne(
    () => Group,
    group => group.user_groups,

    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'}
  )
  @JoinColumn([{ name: 'group_id', referencedColumnName: 'id' }])
  groups: Group[];
}