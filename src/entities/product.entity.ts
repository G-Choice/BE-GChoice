import {  IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PositionEnum, StatusEnum } from 'src/common/enum/enums';
import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductReview } from './ProductReviews.entity';
import { Category } from './category.entity';
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

  @CreateDateColumn({type:"timestamp"})
  created_at: Date;


  @DeleteDateColumn({ nullable: true })
  delete_At: Date;

  
  @OneToMany(() => ProductReview, review => review.product)
  reviews: ProductReview[];

  @ManyToOne(() => Category, category => category.product)
  @JoinColumn({ name: 'category_id' })
  category:Category[]
}
