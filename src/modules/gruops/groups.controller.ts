import { Body,Post, Controller,UseGuards,Get } from '@nestjs/common';
import { GruopsService } from './groups.service';
import { createGroupDto } from './dto/createGroup.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';

@Controller('groups')
export class GruopsController {
    constructor(private groupsService:  GruopsService ) { }


    // @Get()
    // async getAllGroups(@Body() product_id:number): Promise<any>{
    //     return this.groupsService.getAllGroups(product_id);
    // }


    @UseGuards(AuthGuard)
    @Post()
    async createGroups(@Body() data :createGroupDto , @CurrentUser() user: User): Promise<any>{
        return this.groupsService.createGroups(data, user);
    }
    

   
} 

