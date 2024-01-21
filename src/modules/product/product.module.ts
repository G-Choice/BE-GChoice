import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CloudinaryModule,
  ],
  controllers:[ProductController],
  providers: [ProductService],
 
})
export class ProductModule {}
