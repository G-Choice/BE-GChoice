import { Module } from '@nestjs/common';
import { User } from 'src/entities/User.entity';
import { Product } from 'src/entities/product.entity';
import { User_group } from 'src/entities/user_group.entity';
import { GruopsController } from './gruops.controller';
import { GruopsService } from './gruops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/entities/group.entity';


@Module({
    imports: [
      TypeOrmModule.forFeature([Product,User_group,User,Group]),
    ],
    controllers:[GruopsController],
    providers: [GruopsService],
   
  })
export class GruopsModule {}


