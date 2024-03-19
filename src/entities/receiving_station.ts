import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne, DeleteDateColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { User } from './User.entity';
import { Group } from './group.entity';

@Entity('receiving_station')
export class Receiving_station {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    phone: string;
 
    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    created_at?: Date;

    @OneToOne(() => User, user => user.receiving_station)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Group, group => group.receiving_station) 
    group: Group[];
     
}
