// src/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Notifications } from 'src/entities/notification.entity';
import { Repository } from 'typeorm';


@Injectable()
export class NotificationService {

    constructor(
        @InjectRepository(Notifications)
        private readonly notificationsRepository: Repository<Notifications>,

    ) { }
    async getNotificationByUser(user: User): Promise<any> {
        try {
            const notifications = await this.notificationsRepository.find({
                where: {
                    user: { id: user.id }
                },
                order: { created_at: 'DESC' }
            });
            return {
                message: "Notifications retrieved successfully",
                statusCode: 200,
                data: notifications,
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return {
                message: "Failed to retrieve notifications",
                statusCode: 500,
            };
        }
    }
}