import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,} from 'typeorm';
import { addProductDto } from './dto/add-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Product } from 'src/entities/product.entity';
import { PositionEnum, StatusEnum, Order } from 'src/common/enum/enums';
import { GetProductParams } from './dto/get-product.dto';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';
import { log } from 'console';
import { ResponseItem } from 'src/common/dtos/responseItem';
import { loginUserDto } from '../auth/dto/login.dto';
import { Category } from 'src/entities/category.entity';
// import { ProductImage } from 'src/entities/product_image.entity';
import { ProductReview } from 'src/entities/ProductReviews.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    // @InjectRepository(ProductImage)
    // private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductReview)
    private readonly productReviewRepository: Repository<ProductReview>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async addNewProduct(addProductData: addProductDto, files: Array<Express.Multer.File>): Promise<{ status: string; message: string; data: Product }> {
    try {
    const cloudinaryResult = await this.cloudinaryService.uploadImages(files, 'product');
    const secureUrls = cloudinaryResult.map(item => item.secure_url);
      const newProduct = this.productRepository.create({
        product_name: addProductData.product_name,
        price: addProductData.price,
        images:secureUrls,
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
      const productDetail = await this.productRepository
        .createQueryBuilder('product')
        .leftJoin('product.shop', 'shop')
        .addSelect(['shop.id', 'shop.shop_name', 'shop.shop_phone', 'shop.shop_email', 'shop.shop_address', 'shop.shop_image', 'shop.shop_description'])
        .leftJoin('product.discounts', 'discount', 'discount.status = :status', { status: 'active' })
        .addSelect(['discount.id', 'discount.minQuantity', 'discount.discountPercentage'])
        .leftJoin('product.reviews', 'reviews')
        .addSelect(['reviews.id', 'reviews.rating', 'reviews.comment', 'reviews.created_at'])
        .leftJoin('reviews.users', 'users')
        .addSelect(['users.id', 'users.username', 'users.email', 'users.image'])
        .where('product.id = :id', { id })
        .getOne();

      if (!productDetail) {
        throw new NotFoundException('Product not found');
      }

      let totalRating = 0;
      productDetail.reviews.forEach(review => {
        totalRating += review.rating;
      });
      const avgRating = ((totalRating / productDetail.reviews.length) || 0).toFixed(0);
      const discountsWithPrice = productDetail.discounts.map(discount => {
        const discountPrice = (productDetail.price - (productDetail.price * parseFloat(discount.discountPercentage) / 100));
        return { ...discount, discountPrice };
      });

      const responseData = {
        ...productDetail,
        avgrating: avgRating,
        discounts: discountsWithPrice
      };

      return new ResponseItem(responseData, 'Successfully!');
    } catch (error) {
      throw new NotFoundException('Product not found');
    }
  }


}