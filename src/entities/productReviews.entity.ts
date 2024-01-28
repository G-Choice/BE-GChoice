import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn } from "typeorm";
import { IsInt, Min, Max, IsDecimal, MinLength, MaxLength, IsNotEmpty } from "class-validator";
import { Product } from './product.entity';
@Entity('productReviews')
export class ProductReview extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsInt({ message: 'Rating must be an integer' })
    @Min(0, { message: 'Rating must be greater than or equal to 0' })
    @Max(5, { message: 'Rating must be less than or equal to 5' })
    rating: number;

    @Column({ type: "text" })
    @IsNotEmpty({ message: 'Comment cannot be empty' })
    comment: string;

    @Column({ type: "timestamp", nullable: true })
    created_at: Date;
    
// Mối quan hệ  giữa ProductReview và Product
  @ManyToOne(() => Product, product => product.reviews)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
