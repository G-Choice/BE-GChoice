import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductDiscountService {
    constructor(
        @InjectRepository(ProductDiscount)
        private readonly productDiscountRepository: Repository<ProductDiscount>,
      ) {}

    async getProductDiscount(product_id: number): Promise<ProductDiscount[]> {
      return await this.productDiscountRepository.find();
    }

}
