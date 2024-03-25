import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { Shop } from 'src/entities/shop.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { User } from 'src/entities/User.entity';
import { Product } from 'src/entities/product.entity';
import { User_group } from 'src/entities/user_group.entity';
import { Group } from 'src/entities/group.entity';


@Module({

    imports: [TypeOrmModule.forFeature([Shop,User,Product,Group,User_group]),CloudinaryModule],
    controllers: [ShopController ],
    providers: [ShopService ]
})
export class ShopModule {}

