import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { Shop } from 'src/entities/shop.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { User } from 'src/entities/User.entity';
import { Product } from 'src/entities/product.entity';


@Module({

    imports: [TypeOrmModule.forFeature([Shop,User,Product]),CloudinaryModule],
    controllers: [ShopController ],
    providers: [ShopService ]
})
export class ShopModule {}

