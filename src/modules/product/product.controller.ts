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
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { addProductDto } from './dto/add-product.dto';
import { Product } from 'src/entities/product.entity';
import { GetProductParams } from './dto/get-product.dto';

@Controller('products')
export class ProductController {
    constructor(private productService: ProductService) { }

    @Post('addProduct')
    @UseInterceptors(FileInterceptor('image'))
    async addNewProduct(
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                new FileTypeValidator({ fileType: '.(png|jpg)' }),
            ],
        })) image: Express.Multer.File,
        @Body() addProductData: addProductDto,
    ) {
        try {
            const product = await this.productService.addNewProduct(addProductData, image);
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