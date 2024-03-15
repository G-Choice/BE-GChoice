import { Module } from '@nestjs/common';
import { User } from 'src/entities/User.entity';
import { Product } from 'src/entities/product.entity';
import { User_group } from 'src/entities/user_group.entity';
import { GruopsController } from './groups.controller';
import { GruopsService } from './groups.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/entities/group.entity';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { FirebaseModule } from 'src/firebase/firebase.module';
// import { Group_user_product } from 'src/entities/group_user_product.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([Product,User_group,User,Group,ProductDiscount]),
      FirebaseModule
    ],
    controllers:[GruopsController],
    providers: [GruopsService],
   
  })
export class GruopsModule {}


