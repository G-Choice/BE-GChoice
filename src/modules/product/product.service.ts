import { Body, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, Param, Query, UploadedFiles } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, } from 'typeorm';
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
import { ProductReview } from 'src/entities/productReviews.entity';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { Shop } from 'src/entities/shop.entity';
import { UpdateProductDto } from './dto/update_product.dto';
import { Group } from 'src/entities/group.entity';

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
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async addNewProduct(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() addProductData: addProductDto,
    @CurrentUser() user: User,
  ): Promise<{ statusCode: number; message: string; data: Product }> {
    try {
      const Shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
      if (!Shop) {
        return {
          message: "Shop not found.Please create a shop before adding products.",
          data: null,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
      const category = await this.categoryRepository.findOne({ where: { id: addProductData.category_id } });
      if (!category) {
        {
          return {
            message: "Category not found",
            data: null,
            statusCode: HttpStatus.NOT_FOUND,
          }
        }
      }
      const cloudinaryResult = await this.cloudinaryService.uploadImages(files, 'product');
      const secureUrls = cloudinaryResult.map(item => item.secure_url);
      const newProduct = this.productRepository.create({
        product_name: addProductData.product_name,
        price: addProductData.price,
        images: secureUrls,
        status: StatusEnum.ACTIVE,
        description: addProductData.description,
        brand: addProductData.brand,
        quantity_inventory: addProductData.product_availability,
        shop: Shop,
        category: category,
      });
      const savedProduct = await this.productRepository.save(newProduct);
      return {
        statusCode: HttpStatus.OK,
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
  async countProductByShop(user: User): Promise<any> {
    try {
      const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
      if (!shop) {
        throw new NotFoundException('Shop not found');
      }
      const products = await this.productRepository.find({ where: { shop: { id: shop.id } } });
      const productCount = products.length;

      return {
        message: 'Success',
        data: { count: productCount },
        status: HttpStatus.OK
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getAllproductByShop(params: GetProductParams, @CurrentUser() user: User,) {
    const page = params.page || 1;
    const take = params.take || 6;
    const skip = (page - 1) * take;
    const Shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
    const products = this.productRepository
      .createQueryBuilder('product')
      .where('product.shop_id = :shopId ', { shopId: Shop.id })
      .leftJoin('product.category', 'category')
      .addSelect('category.category_name AS category_name')
      .offset(skip)
      .limit(params.take)
      .orderBy('product. created_at', Order.DESC)
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
  async productOfShop(shop_id: number) {
    try {
      const Shop = await this.shopRepository.findOne({ where: { id: shop_id } });
      if (!Shop) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Shop not found',
          data: null,
        };
      }
  
      const products = await this.productRepository
        .createQueryBuilder('product')
        .where('product.shop_id = :shopId', { shopId: Shop.id })
        .leftJoin('product.category', 'category')
        .addSelect('category.category_name AS category_name')
        .orderBy('product.created_at', 'DESC')
        .getMany();
  
      return {
        statusCode: HttpStatus.OK,
        message: 'Product updated successfully',
        data: products,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }
  

  async getAllproduct(params: GetProductParams,) {
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
      .where('product.status = :status AND product.delete_At IS NULL', { status: StatusEnum.ACTIVE })
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
      console.log('====================================');
      console.log(id);
      console.log('====================================');
      const productDetail = await this.productRepository
        .createQueryBuilder('product')
        .leftJoin('product.shop', 'shop')
        .addSelect(['shop.id', 'shop.shop_name', 'shop.shop_phone', 'shop.shop_email', 'shop.shop_address', 'shop.shop_image', 'shop.shop_description'])
        .leftJoin('product.discounts', 'discount', 'discount.status = :status', { status: 'active' })
        .addSelect(['discount.id', 'discount.minQuantity', 'discount.discountPercentage'])
        .leftJoin('product.reviews', 'reviews')
        .addSelect(['reviews.id', 'reviews.rating', 'reviews.comment', 'reviews.created_at'])
        .leftJoin('reviews.user', 'users')
        .addSelect(['users.id', 'users.username', 'users.email', 'users.image'])
        .where('product.id = :id', { id })
        .getOne();
      console.log('====================================');
      console.log(productDetail);
      console.log('====================================');
      if (!productDetail) {
        throw new NotFoundException('Product not found');
      }

      let totalRating = 0;
      productDetail.reviews.forEach(review => {
        totalRating += review.rating;
      });
      const avgRating = ((totalRating / productDetail.reviews.length) || 0).toFixed(0);
      const discountsWithPrice = productDetail.discounts.map(discount => {
        const discountPrice = (productDetail.price - (productDetail.price * discount.discountPercentage / 100));
        return { ...discount, discountPrice };
      });

      const responseData = {
        ...productDetail,
        avgrating: avgRating,
        discounts: discountsWithPrice
      };

      return new ResponseItem(responseData, 'Successfully!');
    } catch (error) {
      console.error(error); 
      throw error; 
    }
  }


  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CurrentUser() user: User,
  ): Promise<{ data: Product | null, message: string, statusCode: number }> {
    try {    
      const category = await this.categoryRepository.findOne({ where: { id: updateProductDto.category_id } });
      if (!category) {
        {
          return {
            message: "Category not found",
            data: null,
            statusCode: HttpStatus.NOT_FOUND,
          }
        }
      }
      const product = await this.productRepository.findOne({ where: { id: id } });     
      if (updateProductDto.status === 'inactive') {
        const activeGroups = await this.groupRepository.find({ where: { products: { id: id } } });
        if (activeGroups.length > 0) {
          return {
            message: "Product has active groups, cannot be updated to 'inactive'",
            data: null,
            statusCode: HttpStatus.BAD_REQUEST,
          };
        }
      }
      product.product_name = updateProductDto.product_name;
      product.price = updateProductDto.price;
      product.description = updateProductDto.description;
      product.brand = updateProductDto.brand;
      product.quantity_inventory = updateProductDto.product_availability;
      product.status = updateProductDto.status;
      product.category = category;
      if (files && files.length > 0) {
        const cloudinaryResult = await this.cloudinaryService.uploadImages(files, 'product');
        product.images = cloudinaryResult.map(item => item.secure_url);
      }
      await this.productRepository.save(product);
      return {
        statusCode: HttpStatus.OK,
        message: 'Product updated successfully',
        data: product,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update user' + error.message,
        data: null,
      };
    }
  }

  async deleteProduct(@Param('id') id: number, @CurrentUser() user: User): Promise<{ message: string, data: Product | null, statusCode: number }> {
    try {  
      const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
      const product = await this.productRepository.findOne({ where: { id: id, shop: { id: shop.id } } });
      if (!product) {
        throw new NotFoundException('Product not found');
      }     
      if (product.status !== 'inactive') {
        return { message: 'Cannot delete product with status other than "inactive"', data: null, statusCode: HttpStatus.BAD_REQUEST };
      }
      await this.productRepository.remove(product);
      return { message: 'Delete category successfully!', data: null, statusCode: HttpStatus.OK };
    } catch (error) {
      console.error('Error deleting product:', error.message);
      return { message: error.message, data: null, statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }

}