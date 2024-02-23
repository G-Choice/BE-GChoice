import { IsNotEmpty, IsString } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity('product_image')

export class ProductImage {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    image_Url: string;

    @ManyToOne(() => Product ,product => product.images)
    @JoinColumn({ name: 'product_id' })
    products: Product;
}
