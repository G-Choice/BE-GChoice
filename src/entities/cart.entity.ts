import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { Group } from "./group.entity";
import { Cart_user } from "./cart_user.entyti";

@Entity('carts')
export class Carts {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default:0})
    total_price: number;

    @Column({default:0})
    total_quantity: number;

    // @ManyToOne(()=>Product ,product => product.carts)
    // @JoinColumn({name:'product_id'})
    // products: Product;

    @OneToOne(() => Group, (group) => group.carts ,{cascade: true})
    @JoinColumn({name:'group_id'}) 
    groups: Group

    @OneToMany(() => Cart_user, cart_user => cart_user.carts)
    cart_users: Cart_user[];
 
}