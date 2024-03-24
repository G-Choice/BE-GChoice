import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User.entity';
import { Product } from './product.entity';
import { PositionStatusGroupEnum } from 'src/common/enum/enums';
import { IsNotEmpty } from 'class-validator';
import { Shop } from './shop.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    total: number;

    @Column({ default: 0 })
    quantity: number;

    @Column({ nullable: true })
    recipientAddress: string;

    @Column({ nullable: true })
    recipientPhoneNumber: string;

    @Column({ type: 'enum', enum: PositionStatusGroupEnum, default: null })
    @IsNotEmpty()
    status: string;

    @Column({ default: false })
    isPayment: boolean;

    @Column({ default: false })
    isFetching_items: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @ManyToOne(() => User, user => user.orders)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Product, product => product.orders)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Shop, shop =>shop.orders)
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;


}
