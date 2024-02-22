  import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
  import { IsInt, Min, IsDate, } from 'class-validator';
  import { Product } from './product.entity';
  import { StatusEnum } from 'src/common/enum/enums';

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
    
    @Column({
      type: 'enum',
      enum: StatusEnum,
      default: StatusEnum.ACTIVE
    })
    status: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => Product, product => product.discounts)
    @JoinColumn({ name: 'product_id' })
    products: Product;


  }
