import {
    Body,
    Controller,
    Delete,
    FileTypeValidator,
    Get,
    InternalServerErrorException,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { addProductDto } from './dto/add-product.dto';
import { Product } from 'src/entities/product.entity';
import { GetProductParams } from './dto/get-product.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateProductDto } from './dto/update_product.dto';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';


@Controller('products')
export class ProductController {
    constructor(private productService: ProductService) { }


    // @UseInterceptors(FileInterceptor('images', { limits: { files: 5 } }))
    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('files', 5))
    async addNewProduct(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() addProductData: addProductDto,
        @CurrentUser() user: User,
    ) {
        try {
            const product = await this.productService.addNewProduct(files, addProductData, user);
            return product;
        } catch (error) {
            console.error('Error in addNewProduct:', error);
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    @Get('/shop')
    @UseGuards(AuthGuard)
    getAllProductByShop(@Query() params: GetProductParams, @CurrentUser() user: User) {
        return this.productService.getAllproductByShop(params, user);
    }

    @UseGuards(AuthGuard)
    @Get('/countProductByShop')
    countProductByShop(@CurrentUser() user: User) {
        return this.productService.countProductByShop(user);
    }
    
    @Get('/productOfShop/:shop_id')
    productOfShop(@Param('shop_id') shop_id : number) {
        return this.productService.productOfShop(shop_id);
    }
    @Get()
    getAllProduct(@Query() params: GetProductParams) {
        return this.productService.getAllproduct(params);
    }

    @Get(':id')
    getDetailProduct(@Param('id') id: number) {
        return this.productService.getProductDetail(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('files', 5))
    async updateProduct(
        @Param('id') id: number,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @CurrentUser() user :User,
    ): Promise<{ data: Product | null, message: string, statusCode: number }> {
        const result = await this.productService.updateProduct(id,updateProductDto,files,user);
        return result;
    }


    @Delete(':id')
    @UseGuards(AuthGuard)
    async deteteProduct(
        @Param('id') id: number,
        @CurrentUser() user: User
    ): Promise<{ message: string, data: Product| null, statusCode: number }> {
        return this.productService.deleteProduct(id, user);
    }


} 
