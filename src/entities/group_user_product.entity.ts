import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { Group } from "./group.entity";
@Entity('group_user_product')
export class Group_user_product {

    @PrimaryGeneratedColumn()
    id: number;

    @PrimaryColumn()
    group_id: number;

    @PrimaryColumn()
    user_id: number;

    @Column()
    quantity: number;

    @Column({ default: 0 })
    price: number;


    @Column({ default: false })
    isPayment: boolean;

    @ManyToOne(
        () => User,
        user => user.group_user_products,
        { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
    )
    @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
    users: User;

    @ManyToOne(
        () => Group,
        groups => groups.group_user_products,
        { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
    )
    @JoinColumn([{ name: 'group_id', referencedColumnName: 'id' }])
    groups: Group;
}