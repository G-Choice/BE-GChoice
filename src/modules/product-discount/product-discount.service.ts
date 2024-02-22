import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseItem } from 'src/common/dtos/responseItem';
import { Product } from 'src/entities/product.entity';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ProductDiscountService {
  constructor(
    @InjectRepository(ProductDiscount)
    private readonly productDiscountRepository: Repository<ProductDiscount>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async getProductDiscount(product_id: number) {

    const product = await this.productRepository.findOne({ where: { id: product_id } });

    if (!product) {
      throw new Error(`Product with id ${product_id} not found`);
    }

    const productPrice = product.price;

    const productDiscounts = await this.productDiscountRepository
    .createQueryBuilder('productDiscount')
    .select([
        'productDiscount.id as id',
        'productDiscount.minQuantity as minQuantity',
        'productDiscount.discountPercentage as discountPercentage',
        'productDiscount.status as status',
        'productDiscount.createdAt as createdAt',
        'productDiscount.updatedAt as updatedAt',
        'productDiscount.product_id as product_id',
        `ROUND(${productPrice} - (${productPrice} * productDiscount.discountPercentage / 100), 2) as discountedPrice` 
    ])
    .where('productDiscount.product_id = :product_id', { product_id })
    .andWhere('productDiscount.status = :status', { status: 'active' })
    .getRawMany();

    return new ResponseItem(productDiscounts, 'sucssecfuly !');

  }
}