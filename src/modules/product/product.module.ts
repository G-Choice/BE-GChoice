import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Category } from 'src/entities/category.entity';
// import { ProductImage } from 'src/entities/product_image.entity';
import { ProductReview } from 'src/entities/ProductReviews.entity';
import {Shop} from 'src/entities/shop.entity';
import { Group } from 'src/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product,Category,ProductReview,Shop,Group]),
    CloudinaryModule,
  ],
  controllers:[ProductController],
  providers: [ProductService],
 
})
export class ProductModule {}
