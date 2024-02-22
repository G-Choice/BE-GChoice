import { Controller, Get, Param } from '@nestjs/common';
import { ProductDiscountService } from './product-discount.service';
import { ProductDiscount } from 'src/entities/product_discount.entity';

@Controller('product-discount')
export class ProductDiscountController {
    constructor(private productDiscountService: ProductDiscountService) { }


    @Get(':product_id')
    getProductDiscount(@Param('product_id') product_id: number): Promise<ProductDiscount[]>{
        return this.productDiscountService.getProductDiscount(product_id);
    }
}


