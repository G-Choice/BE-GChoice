import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Receiving_station } from 'src/entities/receiving_station';
import { Repository } from 'typeorm';

@Injectable()
export class ReceivingStationService {

    constructor(
        @InjectRepository(Receiving_station)
        private readonly receiving_stationRepository: Repository<Receiving_station>,
    ) { }

    async getAllReceivingStation(): Promise<any> {
        const receiving_station = await this.receiving_stationRepository.find()
        return {
            data: receiving_station,
            message: 'Get all receiving station successfully',
            statusCode: HttpStatus.OK
        }
    }
}
