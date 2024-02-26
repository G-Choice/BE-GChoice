import {  IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PositionEnum, StatusEnum } from 'src/common/enum/enums';
import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductReview } from './ProductReviews.entity';
import { Category } from './category.entity';
import { Shop } from './shop.entity';
import { ProductDiscount } from './product_discount.entity';
import { Group } from './group.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  product_name: string;

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

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];
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
  category:Category

  @ManyToOne(() => Shop, shop => shop.products)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToMany(() => Product, product => product.shop)
  products: Product[];

  @OneToMany(() => ProductDiscount, discount => discount.products)
  discounts: ProductDiscount[];

  @OneToMany(() =>  Group,  group => group.products)
  groups: Group[];

}
