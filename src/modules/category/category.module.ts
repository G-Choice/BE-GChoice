import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from 'src/entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Shop } from 'src/entities/shop.entity';
import { Product } from 'src/entities/product.entity';

@Module({

    imports: [TypeOrmModule.forFeature([Category,User,Shop,Product])],
    controllers: [CategoryController],
    providers: [CategoryService ]
})
export class CategoryModule {}

