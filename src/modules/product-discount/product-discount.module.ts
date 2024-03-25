import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { ProductDiscountController } from './product-discount.controller';
import { ProductDiscountService } from './product-discount.service';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/User.entity';
import { Shop } from 'src/entities/shop.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductDiscount,Product,User,Shop]), 
    ],
    controllers: [ProductDiscountController],
    providers: [ProductDiscountService],
})
export class ProductDiscountModule {}
