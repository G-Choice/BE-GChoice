import { Body,Post, Controller,UseGuards,Get, Query, Param } from '@nestjs/common';
import { GruopsService } from './groups.service';
import { createGroupDto } from './dto/createGroup.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { JoinGroupDto } from './dto/join_group.dto';
import { SaveDataPayemntDto } from './dto/save_dataPayment.dto';

@Controller('groups')
export class GruopsController {
    constructor(private groupsService:  GruopsService ) { }



    @UseGuards(AuthGuard)
    @Get(':product_id')
    async getAllGroups(@Param('product_id') product_id: number,@CurrentUser() user: User): Promise<any>{
        return this.groupsService.getAllGroups(product_id,user);

    }


    @Get('/itemGroup/:group_id')
    @UseGuards(AuthGuard)
    async getItemGroups(@Param('group_id') group_id: number,@CurrentUser() user: User): Promise<any>{
        return this.groupsService.getItemGroups(group_id,user);
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
    
    @UseGuards(AuthGuard)
    @Post('/saveDataPayment')   
    async saveDataPayment(@Body() saveDataPayemntDto: SaveDataPayemntDto, @CurrentUser() user: User): Promise<any>{
        return this.groupsService.saveDataPayment(saveDataPayemntDto,user);
    }
    

} 

