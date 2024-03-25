import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseItem } from 'src/common/dtos/responseItem';
import { Product } from 'src/entities/product.entity';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { Repository } from 'typeorm';
import { CreateProductDiscountDto } from './dto/create_discount.dto';
import { User } from 'src/entities/User.entity';
import { Shop } from 'src/entities/shop.entity';
import { PositionEnum, PositionGroupEnum, PositionStatusGroupEnum, StatusEnum } from 'src/common/enum/enums';


@Injectable()
export class ProductDiscountService {
  constructor(
    @InjectRepository(ProductDiscount)
    private readonly productDiscountRepository: Repository<ProductDiscount>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
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

  async getProductDiscountByShop(user: User): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      const discounts = await this.productDiscountRepository
      .createQueryBuilder('product_discount')
      .leftJoinAndSelect('product_discount.products', 'product')
      .where('product_discount.shop = :shopId', { shopId: shop.id })
      .getMany();
      
      if (!discounts || discounts.length === 0) {
        throw new NotFoundException('No product discounts found for this shop');
      }

      return {
        message: 'Success',
        data: discounts,
        status: HttpStatus.OK
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createProductDiscount(createProductDiscountDto: CreateProductDiscountDto, user: User): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
      if (!shop) {
        throw new BadRequestException("Shop not found");
      }
      const product = await this.productRepository.findOne({ where: { id: createProductDiscountDto.product_id } });
      if (!product) {
        throw new BadRequestException("Product not found");
      }
      const newDiscount = this.productDiscountRepository.create({
        minQuantity: createProductDiscountDto.minQuantity,
        discountPercentage: createProductDiscountDto.discountPercentage,
        products: product,
        shop: shop,
      });
      const savedDiscount = await this.productDiscountRepository.save(newDiscount);
      return {
        message: 'Product discount created successfully',
        data: savedDiscount,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteProductDiscount(id: number, user: User): Promise<any> {
    const discount = await this.productDiscountRepository.findOne({ where: { id: id } });
    if (!discount) {
      throw new NotFoundException("Discount not found");
    }
    await this.productDiscountRepository.remove(discount);
    return {
      message: "Discount has been successfully deleted",
      statusCode: HttpStatus.OK
    };
  }
}