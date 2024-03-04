import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { Group } from "./group.entity";
import { PositionGroupEnum } from "src/common/enum/enums";
import { Carts } from "./cart.entity";

@Entity('cart_user')
export class Cart_user {

    @PrimaryGeneratedColumn()
    id: number;

    @PrimaryColumn()
    cart_id: number;

    @PrimaryColumn()
    user_id: number;

    @Column()
    quantity: number;

    @Column({ default: 0 })
    price: number;

    @ManyToOne(
        () => User,
        user => user.cart_users,
        { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
    )
    @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
    users: User[];

    @ManyToOne(
        () => Carts,
        carts => carts.cart_users,
        { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
    )
    @JoinColumn([{ name: 'cart_id', referencedColumnName: 'id' }])
    carts: Carts[];
}