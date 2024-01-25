import {  IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PositionEnum, StatusEnum } from 'src/common/enum/enums';
import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  image: string;

  @Column()
  @IsNumber()
  price: number;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.ACTIVE
  })
  status: string;

  @Column()
  @IsString()
  description: string;

  @Column()
  @IsString()
  brand: string;


  @Column({ default: 0 })
  @IsNumber()
  quantity_sold: number;

  @Column({ default: 0 })
  @IsNumber()
  quantity_inventory: number;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.ACTIVE
  })
  product_availability: string;

  @CreateDateColumn({type:"timestamp"})
  created_at: Date;


  @DeleteDateColumn({ nullable: true })
  delete_At: Date;

  
}
