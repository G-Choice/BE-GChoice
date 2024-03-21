import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ReceivingStationService } from './receiving_station.service';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { AuthGuard } from '../guards/auth.guard';
import { GetGroupParams } from './dto/get_group.dto';

// lấy tất cả các trạm nhận hàng  done
// lấy tất cả các order của trạm đó  done
// update status khi khách hàng đã nhận hàng

@Controller('receiving-station')
export class ReceivingStationController {
    constructor(private readonly receivingStationService: ReceivingStationService) { }

    @Get()
    async getAllReceivingStation(): Promise<any> {
      const result = await this.receivingStationService.getAllReceivingStation();
      return result;
    }

    @Get('/getGroupByReceivingStation') 
    @UseGuards(AuthGuard)
    async getGroupByReceivingStation(@Query()getGroupParams:GetGroupParams,@CurrentUser() user: User): Promise<any> {
        return this.receivingStationService.getGroupByReceivingStation(getGroupParams,user);
    }


    @Put('/confirm_received_item/:id')
    async confirmReceivedItem(@Param('id') id: number, ): Promise<any> {
        return this.receivingStationService.confirmReceivedItem(id);
    }

}
