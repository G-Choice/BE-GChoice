import { Module } from '@nestjs/common';
import { User } from 'src/entities/User.entity';
import { Product } from 'src/entities/product.entity';
import { User_group } from 'src/entities/user_group.entity';
import { GruopsController } from './groups.controller';
import { GruopsService } from './groups.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/entities/group.entity';
import { Carts } from 'src/entities/cart.entity';
import { Cart_user } from 'src/entities/cart_user.entyti';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { FirebaseModule } from 'src/firebase/firebase.module';



@Module({
    imports: [
      TypeOrmModule.forFeature([Product,User_group,User,Group,Carts,Cart_user,ProductDiscount]),
      FirebaseModule
    ],
    controllers:[GruopsController],
    providers: [GruopsService],
   
  })
export class GruopsModule {}


