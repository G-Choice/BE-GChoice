import { Body,Post, Controller,UseGuards } from '@nestjs/common';
import { GruopsService } from './gruops.service';
import { createGroupDto } from './dto/createGroup.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';

@Controller('gruops')
export class GruopsController {
    constructor(private groupsService:  GruopsService ) { }
    @UseGuards(AuthGuard)
    @Post()
    async createGroups(@Body() data :createGroupDto , @CurrentUser() user: User): Promise<any>{
        return this.groupsService.createGroups(data, user);
    }
    
} 

