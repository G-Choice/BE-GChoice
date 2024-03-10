import { Body, HttpStatus, Injectable, UploadedFiles } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CreateShopDTO } from './dto/create_shop.dto';
import { Shop } from 'src/entities/shop.entity';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateShopDTO } from './dto/update_shop.dto';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(Shop)
        private shopRepository: Repository<Shop>,
        @InjectRepository(User)
        private UserRepository: Repository<User>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private cloudinaryService: CloudinaryService,
    ) { }




    async getShopDetail (@CurrentUser() user :User): Promise< { data: Shop | null, message: string, statusCode: number }>{
        console.log(user.id);
        
        const shop = await this.shopRepository.findOne({ where: { user: {id: user.id }}});
        if (!shop) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Shop not found' ,
                data: null,
            };
        }
        return {
            statusCode: HttpStatus.OK,
            message: 'Shop found',
            data: shop,
        };
    }

    async createShop(
        createShopDTO: CreateShopDTO,
        @CurrentUser() user: User,
        files: Array<Express.Multer.File>
    ): Promise<{ data: Shop | null, message: string, statusCode: number }> {
        try {
            const usershop = await this.UserRepository.findOne({ where: { id: user.id } });        
            const existingShop = await this.shopRepository.findOne({ where: { user:{id:user.id } }});
            if (existingShop) {
                return { data: null, message: 'User has already created a shop', statusCode: HttpStatus.BAD_REQUEST };
            }
            const cloudinaryResult = await this.cloudinaryService.uploadImages(files, 'shop');
            const secureUrls = cloudinaryResult.map(item => item.secure_url);
            const newShop = this.shopRepository.create({
                shop_name: createShopDTO.shop_name,
                shop_phone: createShopDTO.shop_phone,
                shop_email:createShopDTO.shop_email,
                shop_address: createShopDTO.shop_address,
                shop_image: secureUrls,
                shop_description: createShopDTO.shop_description,
                user: usershop,
            });
            const savedShop = await this.shopRepository.save(newShop);           
            return {
                statusCode: HttpStatus.CREATED,
                message: 'Shop created successfully!',
                data: savedShop,
            };
        } catch (error) {
            return { 
                data: null, 
                message: 'Failed to create shop'+ error.message ,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
        }
    }
    
    
    async updateShop( @UploadedFiles() files: Array<Express.Multer.File>, 
    @CurrentUser() user: User,
    @Body() updateShopDTO:UpdateShopDTO): Promise<{ data: Shop | null, message: string, statusCode: number }> {
        try {
          const shop = await this.shopRepository.findOne({ where: {user :{ id: user.id }}});
          if (!shop) {
            return {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'Shop not found',
              data: null,
            };
          }
          if (shop.shop_image) {
            shop.shop_image = null;
        }
        shop.shop_name =updateShopDTO.shop_name;
        shop.shop_email = updateShopDTO.shop_email;
        shop.shop_phone = updateShopDTO.shop_phone;
        shop.shop_description =updateShopDTO.shop_description;
        shop.shop_address =updateShopDTO.shop_address;
          if (files && files.length > 0) {
            const cloudinaryResult = await this.cloudinaryService.uploadImages(files, 'shop');
            shop.shop_image = cloudinaryResult.map(item => item.secure_url);
          }
          await this.shopRepository.save(shop);
          return {
            statusCode: HttpStatus.OK,
            message: 'Shop updated successfully',
            data: shop,
          };
        } catch (error) {
          return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Failed to update shop'+error.message,
            data: null,
          };
        }
      }


      async deleteShop(@CurrentUser() user: User): Promise<{ data: Shop | null, message: string, statusCode: number }> {
        try {
          const shop = await this.shopRepository.findOne({ where: {user :{ id: user.id }}});
          if (!shop) {
            return {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'Shop not found',
              data: null,
            };
          }

          const activeProductsCount = await this.productRepository.count({
            where: { shop: { id: shop.id },status: 'active' }
          });
    
          if (activeProductsCount > 0) {
            throw new Error('Cannot delete shop: Active products still exist');
          }

        await this.shopRepository.remove(shop);
        return {
            statusCode: HttpStatus.OK,
            message: 'Shop deleted successfully',
            data: null,
          };
        } catch (error) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: error.message,
              data: null,
            };
        }
      }


}