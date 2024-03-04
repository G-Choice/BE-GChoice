import { Body,Post, Controller,UseGuards,Get, Query } from '@nestjs/common';
import { GruopsService } from './groups.service';
import { createGroupDto } from './dto/createGroup.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { JoinGroupDto } from './dto/join_group.dto';

@Controller('groups')
export class GruopsController {
    constructor(private groupsService:  GruopsService ) { }

    @UseGuards(AuthGuard)
    @Get()
    async getAllGroups(@Query('product_id') product_id: number,@CurrentUser() user: User): Promise<any>{
        return this.groupsService.getAllGroups(product_id,user);
    }


    @Get('cart_group')
    async getCartUsers(@Query('group_id') group_id: number): Promise<any>{
        return this.groupsService.getCartGroups(group_id);
    }



    @UseGuards(AuthGuard)
    @Post()
    async createGroups(@Body() data :createGroupDto , @CurrentUser() user: User): Promise<any>{
        return this.groupsService.createGroups(data, user);
    }

    @UseGuards(AuthGuard)
    @Post('/joinGroup')   
    async joinGroup(@Body() joinGroupDto: JoinGroupDto, @CurrentUser() user: User): Promise<any>{
        return this.groupsService.joinGroup(joinGroupDto,user);
    }
    

   
} 

