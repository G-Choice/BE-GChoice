import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addProductDto } from './dto/add-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Product } from 'src/entities/product.entity';
import { PositionEnum, StatusEnum, Order } from 'src/common/enum/enums';
import { GetProductParams } from './dto/get-product.dto';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';

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


  // async findAll(): Promise<Product[]> {
  //   return await this.productRepository
  //     .createQueryBuilder('product')
  //     .leftJoinAndSelect('product.reviews', 'reviews')
  //     .select(['product.*'])
  //     .addSelect('AVG(reviews.rating)', 'avgRating')
  //     .addGroupBy('product.id')
  //     .getRawMany();

  // }
  async getAllproduct(params: GetProductParams) {
    const products = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.reviews','reviews')
      .select(['product.*'])
      .addSelect('AVG(reviews.rating)','avgRating')
      .addGroupBy('product.id')
      .where('product.status = :status', { status: StatusEnum.ACTIVE })
      .skip(params.skip)
      .take(params.take)
      .orderBy('product.quantity_sold', Order.DESC);
    if (params.searchByName) {
      products.andWhere('product.product_name ILIKE :name', {
        name: `%${params.searchByName}%`,
      });
    }
    if (params.sortByPrice === 'asc') {
      products.orderBy('product.price', Order.ASC);
    } 
    else if (params.sortByPrice === 'desc') {
      products.orderBy('product.price', Order.DESC);
    }
    if (params.searchByCategory) {
    products.andWhere('category.id = :categoryId', {
      categoryId: params.searchByCategory,
    });
  }

    const [result, total] = await products.getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });

    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }

}