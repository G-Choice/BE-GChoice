// src/payment/payment.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus, Get, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../guards/auth.guard';
import { User } from 'src/entities/User.entity';
import { CurrentUser } from '../guards/user.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @UseGuards(AuthGuard)
    async getNotificationByUser(@CurrentUser() user: User): Promise <any>{
        const  notifications =  await this.notificationService.getNotificationByUser(user)
        return  notifications;
    }
}
