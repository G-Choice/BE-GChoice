import { IsNotEmpty, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('notifications')
export class Notifications {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    title: string;
    
    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsString()
    body: string;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    created_at?: Date;

    @ManyToOne(() => User, user => user.notifications)
    @JoinColumn({ name: 'user_id' })
    user: User;
    
}
