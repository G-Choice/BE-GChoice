import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { PositionEnum ,StatusEnum } from 'src/common/enum/enums';
import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, OneToMany, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { Shop } from './shop.entity';
import { ProductReview } from './productReviews.entity';
import { Group } from './group.entity';
import { User_group } from './user_group.entity';
import { Receiving_station } from './receiving_station';
import { Notifications } from './notification.entity';
import { Order } from './order.entity';

@Entity('users')
export class User {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  username: string;

  @Column({ type: 'varchar', length: 255 })
  @IsEmail()  
  email: string;

  @Column({ type: 'varchar' })
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  number_phone: string;

  @Column({ type: 'varchar', length: 255})
  @IsOptional()
  password: string;

  @Column({ type: 'varchar', length: 255 , nullable: true })
  @IsOptional()
  address: string;

  @Column({ type: 'text', array: true, default: null })
  @IsOptional()
  image: string[];
  
  
  @Column({ type: 'varchar', length: 255  ,default: null})
  @IsOptional()
  fcmToken: string;
  
  @Column({
    type: 'enum',
    enum: PositionEnum,
    default: PositionEnum.USER
  })
  role: string;

  @Column( {type: 'enum',
  enum: StatusEnum,
  default: StatusEnum.ACTIVE})
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  refreshToken: string;

  @Column({ default: false })
  isVerified:boolean;
  
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToOne(() => Shop, shop => shop.user) 
  shop: Shop;
  @OneToOne(() => Receiving_station, receiving_station => receiving_station.user) 
  receiving_station:Receiving_station;

  @OneToMany(() => ProductReview , productReviews => productReviews.user)
  productReviews:  ProductReview [];
  
  // @ManyToMany(() => Group, group => group.users)
  // groups: Group[];

  @OneToMany(() =>  User_group, user_group =>  user_group .users)
  user_groups: User_group[];

  @OneToMany(() => Notifications, notification => notification.user)
  notifications: Notifications[];

  @OneToMany(() => Order, order => order.user)
  orders: Order[];
} 