import { Body, Post, Controller, UseGuards, Get, Query, Param, Put, Delete, NotFoundException } from '@nestjs/common';
import { GruopsService } from './groups.service';
import { createGroupDto } from './dto/createGroup.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { JoinGroupDto } from './dto/join_group.dto';
import { SaveDataPayemntDto } from './dto/save_dataPayment.dto';
import { GetGroupParams } from './dto/get_group.dto';
import { GetGroupByUserParams } from './dto/getGroupByUser.dto';

@Controller('groups')
export class GruopsController {
    constructor(private groupsService: GruopsService) { }


    @Get('/getGroupByShop')
    @UseGuards(AuthGuard)
    async getGroupsByShop(@Query() getGroupParams: GetGroupParams, @CurrentUser() user: User): Promise<any> {
        return this.groupsService.getGroupsByShop(getGroupParams, user);
    }
    @UseGuards(AuthGuard)
    @Get('/:product_id')
    async getAllGroups(@Param('product_id') product_id: number, @Query() params: GetGroupByUserParams, @CurrentUser() user: User): Promise<any> {
        return this.groupsService.getAllGroups(product_id, params, user);

    }
    @Get('/statusGroup/:group_id')
    async getStatusGroups(@Param('group_id') group_id: number): Promise<any> {
        return this.groupsService.getStatusGroups(group_id);
    }

    @Get('/itemGroup/:group_id')
    @UseGuards(AuthGuard)
    async getItemGroups(@Param('group_id') group_id: number, @CurrentUser() user: User): Promise<any> {
        return this.groupsService.getItemGroups(group_id, user);
    }


    @UseGuards(AuthGuard)
    @Get()
    async getAllGroupsbyUser(@CurrentUser() user: User): Promise<any> {
        try {
            const userGroups = await this.groupsService.getAllGroupsbyUser(user);
            return userGroups;
        } catch (error) {
            throw new Error("Error retrieving user's groups.");
        }
    }


    @UseGuards(AuthGuard)
    @Post()
    async createGroups(@Body() data: createGroupDto, @CurrentUser() user: User): Promise<any> {
        return this.groupsService.createGroups(data, user);
    }

    @UseGuards(AuthGuard)
    @Post('/joinGroup')
    async joinGroup(@Body() joinGroupDto: JoinGroupDto, @CurrentUser() user: User): Promise<any> {
        return this.groupsService.joinGroup(joinGroupDto, user);
    }

    @UseGuards(AuthGuard)
    @Delete('/remove-user/:group_id')
    async removeUserFromGroup(@Param('group_id') group_id: number,@CurrentUser() user: User): Promise<any> {
        try {
            return await this.groupsService.removeUserFromGroup(group_id,user);
        } catch (error) {
            throw new NotFoundException(error.message || 'Failed to remove user from group');
        }
    }

    @UseGuards(AuthGuard)
    @Delete('/delete-group/:group_id')
    async deleteGroup(@Param('group_id') group_id: number,@CurrentUser() user: User): Promise<any> {
        try {
            return await this.groupsService.deleteGroup(group_id,user);
        } catch (error) {
            throw new NotFoundException(error.message || 'Failed to delete group');
        }
    }
    

    @UseGuards(AuthGuard)
    @Post('/saveDataPayment')
    async saveDataPayment(@Body() saveDataPayemntDto: SaveDataPayemntDto, @CurrentUser() user: User): Promise<any> {
        return this.groupsService.saveDataPayment(saveDataPayemntDto, user);
    }

    @UseGuards(AuthGuard)
    @Put('/confirmOrder/:id')
    async confirmOrder(@Param('id') id: number, @CurrentUser() user: User): Promise<any> {
        return this.groupsService.confirmOrder(id, user);
    }

}

