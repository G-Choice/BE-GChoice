import { IsNotEmpty } from "class-validator";
import { Column, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./User.entity";

@Entity('group')
export class Group {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty()
    group_name: string;

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty()
    description: string;

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    image: string;


    @Column({ type: 'integer' }) 
    groupSize: number;

    @Column({ type: 'timestamp'}) // Sử dụng kiểu timestamp cho groupTime
    @IsNotEmpty()
    groupTime: Date;

    @DeleteDateColumn({ nullable: true , default: () => 'CURRENT_TIMESTAMP' })
    create_At: Date;
   
  @ManyToOne(() => Product, product => product.groups)
  @JoinColumn({ name: 'product_id' })
  products: Product;

  @ManyToMany(() =>User,user =>user.groups,{ cascade: true })
  users:  User [];
  
}