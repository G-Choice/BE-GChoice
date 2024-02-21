import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addProductDto } from './dto/add-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Product } from 'src/entities/product.entity';
import { PositionEnum, StatusEnum, Order } from 'src/common/enum/enums';
import { GetProductParams } from './dto/get-product.dto';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';
import { log } from 'console';
import { ResponseItem } from 'src/common/dtos/responseItem';


@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async addNewProduct(addProductData: addProductDto, image: Express.Multer.File): Promise<{ status: string; message: string; data: Product }> {
    try {
      const cloudinaryResult = await this.cloudinaryService.uploadImage(image, 'product');
      const imageUrl = cloudinaryResult.secure_url;
      const newProduct = this.productRepository.create({
        product_name: addProductData.product_name,
        image: imageUrl,
        price: addProductData.price,
        status: StatusEnum.ACTIVE,
        description: addProductData.description,
        brand: addProductData.brand,
      });
      const savedProduct = await this.productRepository.save(newProduct);
      return {
        status: 'success',
        message: 'Product added successfully!',
        data: savedProduct,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllproduct(params: GetProductParams) {
    const page = params.page || 1;
    const take = params.take || 6;
    console.log(page);
    console.log(take);
    
    const skip = (page - 1) * take;
    const products = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.reviews', 'reviews')
      .select(['product.*', 'product.id as product_id', 'product.quantity_sold as product_quantity_sold', 'product.price as product_price'])
      .addSelect('AVG(reviews.rating)', 'avgRating')
      .addGroupBy('product.id')
      .where('product.status = :status', { status: StatusEnum.ACTIVE })
      .offset(skip)
      .limit(params.take)
      .orderBy('product.quantity_sold', Order.DESC)
    if (params.searchByName) {
      products.andWhere('LOWER(product.product_name) LIKE LOWER(:productName)', {
        productName: `%${params.searchByName}%`,
      });
    }
    if (params.sortByPrice === 'asc') {
      products.orderBy('product.price', Order.ASC);
    }
    else if (params.sortByPrice === 'desc') {
      products.orderBy('product.price', Order.DESC);
    }
    if (params.searchByCategory) {
      products.andWhere('category_id = :categoryId', {
        categoryId: params.searchByCategory,
      });
    }

    const [_, total] = await products.getManyAndCount();
    const result = await products.getRawMany();
    console.log('result', result);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: params,
      itemCount: total,
    });

    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }

  async getProductDetail(id: number): Promise<ResponseItem<any>> {
    try {
      const product = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.shop', 'shop') 
        .select([
          'product.id',
          'product.product_name',
          'product.image',
          'product.price',
          'product.status',
          'product.description',
          'product.brand',
          'product.quantity_sold',
          'product.quantity_inventory',
          'product.created_at',
          'shop.id AS shop_id',
          'shop.shop_name'
        ])
        .where('product.id = :id', { id })
        .andWhere('product.delete_At IS NULL')
        .getRawOne();
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return new ResponseItem(product, 'Successfully!');
    } catch (error) {
      throw new NotFoundException('Product not found');
    }
  }
  
}