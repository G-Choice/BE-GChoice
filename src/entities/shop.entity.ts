import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne, DeleteDateColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { User } from './User.entity';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { Group } from './group.entity';
import { Order } from './order.entity';

@Entity('shops')
export class Shop {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    shop_name: string;

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    shop_phone: string;

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    shop_email: string

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    shop_address: string;

    @Column({ type: 'text', array: true, default: '{}' })
    @IsOptional()
    shop_image: string[];

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    shop_description: string;


    @CreateDateColumn({ type: 'timestamp', nullable: true })
    created_at?: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at?: Date;

    @OneToOne(() => User, user => user.shop)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Group, group => group.shop) // Establishing a One-to-Many relationship with Group
    groups: Group[]; // Assuming a shop can have multiple groups
    @OneToMany(() => Product, product => product.shop,{
        cascade: true,
    })
    products: Product[];

    @OneToMany(() => Category, category => category.shop,)
    categories: Category[];


    @OneToMany(() => Order, order => order.shop,)
    orders: Order[];
}
