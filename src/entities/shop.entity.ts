import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { User } from './User.entity';
import { Product } from './product.entity';

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

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    shop_image: string;

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    shop_description: string;


    @CreateDateColumn({ type: 'timestamp', nullable: true })
    created_at?: Date;

    @Column({ type: 'timestamp', nullable: true })
    deleted_at?: Date;

    @ManyToOne(() => User, user => user.shops)
    @JoinColumn({ name: 'user_id' })
    user: User;

    
    @OneToMany(() => Product, product => product.shop)
    products: Product[];
}
