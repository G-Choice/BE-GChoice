import {
    Body,
    Controller,
    FileTypeValidator,
    InternalServerErrorException,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { addProductDto } from './dto/add-product.dto';

@Controller('product')
export class ProductController {
    constructor(private productService: ProductService){}
    @Post('addProduct')
    @UseInterceptors(FileInterceptor('image'))
    async addNewProduct(
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                new FileTypeValidator({ fileType: '.(png|jpg)' }),
            ],
        })) image: Express.Multer.File,
        @Body() addProductData:addProductDto,
    ) {
        try {
            
            const product = await this.productService.addProduct(addProductData, image);
            return product;
        } catch (error) {
            console.error('Error in addNewProduct:', error);
            throw new InternalServerErrorException('Internal Server Error');
        }
    }
}
