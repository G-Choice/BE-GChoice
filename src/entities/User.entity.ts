import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { PositionEnum ,StatusEnum } from 'src/common/enum/enums';
import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, OneToMany } from 'typeorm';
import { Shop } from './shop.entity';

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

  @Column({ type: 'varchar', length: 255 })
  @IsOptional()
  password: string;

  @Column({ type: 'varchar', length: 255 , nullable: true })
  @IsOptional()
  address: string;

  @Column({ type: 'varchar', length: 255  ,nullable: true })
  @IsOptional()
  image: string;

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

  @OneToMany(() => Shop, (shop) => shop.user)
  shops: Shop[]
}