import { Body,Post, Controller } from '@nestjs/common';
import { GruopsService } from './gruops.service';
import { createGroupDto } from './dto/createGroup.dto';

@Controller('gruops')
export class GruopsController {
    constructor(private groupsService:  GruopsService ) { }
    @Post()
    async createGroups(@Body() data :createGroupDto ): Promise<any>{
        return this.groupsService.createGroups(data);
    }
   
} 

