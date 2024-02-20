import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsInt, Min, IsDate, } from 'class-validator';
import { Product } from './product.entity';

@Entity('product_discount')
export class ProductDiscount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsInt()
  @Min(1)
  minQuantity: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discountPercentage: number;

  @Column({ type: 'timestamp' })
  @IsDate()
  discountStartDate: Date;

  @Column({ type: 'timestamp' })
  @IsDate()
  discountEndDate: Date;

  @Column()
  @IsInt()
  discountStatus: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;



}
