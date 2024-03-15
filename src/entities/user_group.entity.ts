import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { Group } from "./group.entity";
import { PositionGroupEnum } from "src/common/enum/enums";
import { IsNotEmpty } from "class-validator";

@Entity('user_group')
export class User_group {

  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // group_id: number;

  // @Column()
  // user_id: number;

  @Column({ type: 'enum', enum: PositionGroupEnum, default: null })
  @IsNotEmpty()
  role: string;
  
  @Column({default:0})
  quantity: number;

  @Column({ default: 0 })
  price: number;


  @Column({ default: false })
  isPayment: boolean;

  @ManyToOne(
    () => User,
    user => user.user_groups,

    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
  )
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  users: User;

  @ManyToOne(
    () => Group,
    group => group.user_groups,

    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
  )
  @JoinColumn([{ name: 'group_id', referencedColumnName: 'id' }])
  groups: Group;
}