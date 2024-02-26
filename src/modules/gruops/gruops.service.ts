import { Injectable } from '@nestjs/common';
import { GruopsController } from './gruops.controller';
import { Group } from 'src/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createGroupDto } from './dto/createGroup.dto';


@Injectable()
export class GruopsService {
    constructor(
        @InjectRepository( Group )
        private readonly  groupRepository: Repository< Group >,

      ) { }

    async createGroups(data:createGroupDto):Promise<any>{
           

    }
}
