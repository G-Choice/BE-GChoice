import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addProductDto } from './dto/add-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Product } from 'src/entities/product.entity';
import { PositionEnum, StatusEnum } from 'src/common/enum/enums';

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
        product_availability: StatusEnum.ACTIVE,
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


  async findAll(): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.reviews', 'reviews')
      .addSelect('AVG(reviews.rating)', 'avgRating')
      .addGroupBy('product.id')
      .addGroupBy('reviews.id')
      .getRawMany();
  }

}