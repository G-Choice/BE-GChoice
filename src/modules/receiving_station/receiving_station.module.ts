import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivingStationController } from './receiving_station.controller';
import { ReceivingStationService } from './receiving_station.service';
import { Receiving_station } from 'src/entities/receiving_station';
import { User_group } from 'src/entities/user_group.entity';
import { User } from 'src/entities/User.entity';
import { Group } from 'src/entities/group.entity';
import { Product } from 'src/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receiving_station,User_group,User,Group,Product])],
  controllers: [ReceivingStationController],
  providers: [ReceivingStationService]
})
export class ReceivingStationModule {}
