// category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  @IsNotEmpty()
  @IsString()
  category_name: string;

  @CreateDateColumn({type: 'timestamp', nullable: true })
  created_at?: Date;

  @Column({type: 'timestamp', nullable: true })
  deleted_at?: Date;
  @OneToMany(() => Product , product => product.category)
  product:Product
}
