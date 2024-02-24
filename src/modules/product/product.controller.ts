import {
    Body,
    Controller,
    FileTypeValidator,
    Get,
    InternalServerErrorException,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Query,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { addProductDto } from './dto/add-product.dto';
import { Product } from 'src/entities/product.entity';
import { GetProductParams } from './dto/get-product.dto';

@Controller('products')
export class ProductController {
    constructor(private productService: ProductService) { }

    
    // @UseInterceptors(FileInterceptor('images', { limits: { files: 5 } }))
    @Post()
    @UseInterceptors(FilesInterceptor('files', 5))
    async addNewProduct(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() addProductData: addProductDto,
    ) {
        try {
            const product = await this.productService.addNewProduct(addProductData,files);
            return product;
        } catch (error) {
            console.error('Error in addNewProduct:', error);
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    @Get()
    getAllProduct(@Query() params: GetProductParams) {
        return this.productService.getAllproduct(params);
    }

    @Get(':id')
    getDetailProduct(@Param('id') id: number) {
        return this.productService.getProductDetail(id);
    }
} 
