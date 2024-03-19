import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./User.entity";
import { User_group } from "./user_group.entity";
import { PositionStatusGroupEnum } from "src/common/enum/enums";
import { Shop } from "./shop.entity";
import { Receiving_station } from "./receiving_station";

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
  expected_quantity: number;


  @Column({ default: 0 })
  current_quantity: number;


  @Column({ nullable: true, default: false })
  isConfirm: boolean;


  @Column({ type: 'timestamp' })
  @IsNotEmpty()
  expiration_time: Date;


  @CreateDateColumn({ nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  create_At: Date;

  @Column({ nullable: true })
  deliveryAddress: string;

  @Column({ nullable: true })
  phoneNumber: string


  @Column({ type: 'enum', enum: PositionStatusGroupEnum, default: null })
  @IsNotEmpty()
  status: string;

  @ManyToOne(() => Shop, shop => shop.groups) // Establishing a Many-to-One relationship with Shop
  @JoinColumn({ name: 'shop_id' })
  shop: Shop; // Assuming each group belongs to a single shop
  @UpdateDateColumn({ nullable: true })
  update_At: Date; 
  
  @ManyToOne(() => Product, product => product.groups)
  @JoinColumn({ name: 'product_id' })
  products: Product;

  @ManyToMany(() => User, user => user.groups)
  users: User[];

  @OneToMany(() => User_group, user_group => user_group.groups)
  user_groups: User_group[];

  @ManyToOne(() => Receiving_station, receiving_station => receiving_station.group) 
  receiving_station: Receiving_station; 
}