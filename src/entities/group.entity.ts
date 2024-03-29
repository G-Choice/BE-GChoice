import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./User.entity";
import { Carts } from "./cart.entity";
import { User_group } from "./user_group.entity";

@Entity('groups')
export class Group {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty()
    group_name: string;

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty()
    description: string;

    @Column({ type: 'varchar' ,nullable: true })
    @IsNotEmpty()
    image: string;


    @Column({ type: 'integer' }) 
    groupSize: number;

    @Column({ type: 'timestamp'})
    @IsNotEmpty()
    groupTime: Date;

    @Column({ type: 'varchar', length: 255,default:null })
    @IsNotEmpty()
    status: string;


    @CreateDateColumn({ nullable: true , default: () => 'CURRENT_TIMESTAMP' })
    create_At: Date;
   
  @ManyToOne(() => Product, product => product.groups)
  @JoinColumn({ name: 'product_id' })
  products:Product;

  
  @OneToOne(() =>  Carts, ( carts) =>  carts.groups)
  carts:Carts;

  @ManyToMany(
    () => User , 
    user  => user.groups, //optional
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'})
    @JoinTable({
      name: 'user_group',
      joinColumn: {
        name: 'group_id',
        referencedColumnName: 'id',
      },
      inverseJoinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
      },
    })
    users?: User[];
  
    @OneToMany(() =>  User_group, user_group =>  user_group .groups)
    user_groups: User_group[];

}