import { Controller, Get } from '@nestjs/common';
import { ReceivingStationService } from './receiving_station.service';
// lấy tất cả các trạm nhận hàng 
// lấy tất cả các order của trạm đó
// update status khi khách hàng đã nhận hàng

@Controller('receiving-station')
export class ReceivingStationController {
    constructor(private readonly receivingStationService: ReceivingStationService) { }

    @Get()
    async getAllReceivingStation(): Promise<any> {
      const result = await this.receivingStationService.getAllReceivingStation();
      return result;
    }

}
