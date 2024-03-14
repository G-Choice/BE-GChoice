import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { PositionEnum ,StatusEnum } from 'src/common/enum/enums';
import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, OneToMany, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { Shop } from './shop.entity';
import { ProductReview } from './ProductReviews.entity';
import { Group } from './group.entity';
// import { Cart_user } from './cart_user.entyti';
import { User_group } from './user_group.entity';
import { Group_user_product } from './group_user_product.entity';

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

  @OneToMany(() => ProductReview , (productReviews) => productReviews.users)
  productReviews:  ProductReview [];

  

  @ManyToMany(
    () => Group,
    group => group.users,
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION',},
  )
  groups?: Group[];

  // @OneToMany(() => Cart_user, cart_user => cart_user.users)
  // cart_users: Cart_user[];


  @OneToMany(() => Group_user_product, group_user_product => group_user_product.users)
  group_user_products: Group_user_product[];



  @OneToMany(() =>  User_group, user_group =>  user_group .users)
  user_groups: User_group[];

  
} 