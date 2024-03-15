import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./User.entity";
// import { Carts } from "./cart.entity";
import { User_group } from "./user_group.entity";
// import { Group_user_product } from "./group_user_product.entity";
import { PositionStatusGroupEnum } from "src/common/enum/enums";

@Entity('groups')
export class Group {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  group_name: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  description: string;

  @Column({ type: 'varchar', nullable: true })
  @IsNotEmpty()
  image: string;


  @Column({ type: 'integer' })
  groupSize: number;

  @Column({ type: 'timestamp' })
  @IsNotEmpty()
  groupTime: Date;

  @Column({ type: 'enum',enum:PositionStatusGroupEnum ,default:null})
  @IsNotEmpty()
  status: string;

  @Column({ default: 0 })
  total_quantity: number;

  @CreateDateColumn({ nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  create_At: Date;

  @Column({ nullable: true, default:false })
  isConfirm:boolean;

  @Column({ nullable: true })
  deliveryAddress: string;

  @Column({ nullable: true })
  phoneNumber: string
  
  @ManyToOne(() => Product, product => product.groups)
  @JoinColumn({ name: 'product_id' })
  products: Product;


  @ManyToMany(
    () => User,
    user => user.groups, //optional
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinTable({
    name: 'user_group',
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users?: User[];

  @OneToMany(() => User_group, user_group => user_group.groups)
  user_groups: User_group[];


  // @OneToMany(() => Group_user_product, group_user_product => group_user_product.groups)
  // group_user_products: Group_user_product[];

}