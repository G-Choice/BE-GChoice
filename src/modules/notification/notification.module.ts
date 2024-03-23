import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifications } from 'src/entities/notification.entity';
import { User } from 'src/entities/User.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notifications,User]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
 
})
export class NotificationModule {}
