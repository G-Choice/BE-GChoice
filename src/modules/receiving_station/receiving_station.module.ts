import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivingStationController } from './receiving_station.controller';
import { ReceivingStationService } from './receiving_station.service';
import { Receiving_station } from 'src/entities/receiving_station';

@Module({
  imports: [TypeOrmModule.forFeature([Receiving_station])],
  controllers: [ReceivingStationController],
  providers: [ReceivingStationService]
})
export class ReceivingStationModule {}
