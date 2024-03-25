import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProductDiscountService } from './product-discount.service';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { AuthGuard } from '../guards/auth.guard';
import { CreateProductDiscountDto } from './dto/create_discount.dto';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';

@Controller('productDiscount')
export class ProductDiscountController {
    constructor(private productDiscountService: ProductDiscountService) { }

    @UseGuards(AuthGuard)
    @Get("/getAlldiscounts")
    getProductDiscountByShop(@CurrentUser() user: User) {
        return this.productDiscountService.getProductDiscountByShop(user);
    }
    
    @Get(':product_id')
    getProductDiscount(@Param('product_id') product_id: number) {
        return this.productDiscountService.getProductDiscount(product_id);
    }

  
    @UseGuards(AuthGuard)
    @Post()
    async create(@Body() createProductDiscountDto: CreateProductDiscountDto, @CurrentUser() user: User): Promise<any> {
        return await this.productDiscountService.createProductDiscount(createProductDiscountDto, user);
    }


    @UseGuards(AuthGuard)
    @Delete('/:id')
    async deleteProductDiscount(@Param('id') id: number,@CurrentUser() user: User): Promise<void> {
        await this.productDiscountService.deleteProductDiscount(id,user);
    }
}


