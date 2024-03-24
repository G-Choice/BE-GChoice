import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { SaveDataDto } from './dto/saveData.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';

@Controller('order')
export class OrderController {

    constructor(
        private readonly orderService: OrderService)
        { }
        @UseGuards(AuthGuard)
        @Post()
        async saveDataPayment(@Body() saveDataPayemntDto: SaveDataDto, @CurrentUser() user: User): Promise<any> {
            return this.orderService.saveData(saveDataPayemntDto, user);
        }
    
      
}
