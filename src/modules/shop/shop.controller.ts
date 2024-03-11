import { Body, Controller, Patch, Post, UploadedFiles, UseGuards, UseInterceptors, Get, Delete } from '@nestjs/common';
import { ShopService } from './shop.service';
import { AuthGuard } from '../guards/auth.guard';
import { CreateShopDTO } from './dto/create_shop.dto';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Shop } from 'src/entities/shop.entity';
import { UpdateShopDTO } from './dto/update_shop.dto';


@Controller('shop')
export class ShopController {
    constructor(
        private readonly shopService: ShopService
    ) { }



    @Get('/shopdetail')
    @UseGuards(AuthGuard)
    async getShopDetail(
        @CurrentUser() user: User
    ): Promise<{ data: Shop | null, message: string, statusCode: number }> {
        return await this.shopService.getShopDetail(user);
    }

    @Post()
    @UseInterceptors(FilesInterceptor('files', 5))
    @UseGuards(AuthGuard)
    async createShop(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() createShopDTO: CreateShopDTO,
        @CurrentUser() user: User
    ): Promise<{ data: Shop | null, message: string, statusCode: number }> {
        const result = await this.shopService.createShop(createShopDTO, user, files);
        return result;
    }


    @Patch()
    @UseInterceptors(FilesInterceptor('files', 5))
    @UseGuards(AuthGuard)
    async updateUser(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @CurrentUser() user: User,
        @Body() updateShopDTO: UpdateShopDTO): Promise<{ data: Shop | null, message: string, statusCode: number }> {
        const result = await this.shopService.updateShop(files, user, updateShopDTO);
        return result;
    }

    @Delete()
    @UseGuards(AuthGuard)
    async deleteShop(@CurrentUser() user: User): Promise<any>{
        return this.shopService.deleteShop(user);
    }

}
