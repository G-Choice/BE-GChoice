import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { ProductDiscountController } from './product-discount.controller';
import { ProductDiscountService } from './product-discount.service';
import { Product } from 'src/entities/product.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductDiscount,Product]), 
    ],
    controllers: [ProductDiscountController],
    providers: [ProductDiscountService],
})
export class ProductDiscountModule {}
