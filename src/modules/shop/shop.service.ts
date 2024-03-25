import { Body, HttpStatus, Injectable, UploadedFiles } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, UpdateResult } from 'typeorm';
import { CreateShopDTO } from './dto/create_shop.dto';
import { Shop } from 'src/entities/shop.entity';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateShopDTO } from './dto/update_shop.dto';
import { Product } from 'src/entities/product.entity';
import { Group } from 'src/entities/group.entity';
import { User_group } from 'src/entities/user_group.entity';
import { PositionStatusGroupEnum } from 'src/common/enum/enums';
import { log } from 'console';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User_group)
    private user_groupRepository: Repository<User_group>,
    private cloudinaryService: CloudinaryService,
  ) { }




  async getShopDetail(@CurrentUser() user: User): Promise<{ data: Shop | null, message: string, statusCode: number }> {
    console.log(user.id);

    const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
    if (!shop) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Shop not found',
        data: null,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Shop found',
      data: shop,
    };
  }
  async shopdInfor(shop_id: number): Promise<{ data: Shop | null, message: string, statusCode: number }> {
    const shop = await this.shopRepository.findOne({ where: { id: shop_id } });
    if (!shop) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Shop not found',
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
      const existingShop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
      if (existingShop) {
        return { data: null, message: 'User has already created a shop', statusCode: HttpStatus.BAD_REQUEST };
      }
      const cloudinaryResult = await this.cloudinaryService.uploadImages(files, 'shop');
      const secureUrls = cloudinaryResult.map(item => item.secure_url);
      const newShop = this.shopRepository.create({
        shop_name: createShopDTO.shop_name,
        shop_phone: createShopDTO.shop_phone,
        shop_email: createShopDTO.shop_email,
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
        message: 'Failed to create shop' + error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }


  async updateShop(@UploadedFiles() files: Array<Express.Multer.File>,
    @CurrentUser() user: User,
    @Body() updateShopDTO: UpdateShopDTO): Promise<{ data: Shop | null, message: string, statusCode: number }> {
    try {
      const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
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
      shop.shop_name = updateShopDTO.shop_name;
      shop.shop_email = updateShopDTO.shop_email;
      shop.shop_phone = updateShopDTO.shop_phone;
      shop.shop_description = updateShopDTO.shop_description;
      shop.shop_address = updateShopDTO.shop_address;
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
        message: 'Failed to update shop' + error.message,
        data: null,
      };
    }
  }


  async deleteShop(@CurrentUser() user: User): Promise<{ data: Shop | null, message: string, statusCode: number }> {
    try {
      const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
      if (!shop) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Shop not found',
          data: null,
        };
      }

      const activeProductsCount = await this.productRepository.count({
        where: { shop: { id: shop.id }, status: 'active' }
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

  async getRevenueDataForCurrentYear(@CurrentUser() user: User): Promise<{ month: number, revenue: number }[]> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; 
    const currentYear = currentDate.getFullYear();
    const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
    const monthlyRevenues: { month: number, revenue: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(currentYear, currentMonth - 1 - i, 1); 
      const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1); 
      const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

      const totalRevenue = await this.groupRepository.createQueryBuilder("group")
        .select("SUM(user_group.price)", "totalRevenue")
        .innerJoin("group.user_groups", "user_group")
        .where("group.shop_id = :shopId", { shopId: shop.id })
        .andWhere("group.status = :status", { status: PositionStatusGroupEnum.COMPLETED })
        .andWhere("group.update_At BETWEEN :startDate AND :endDate", { startDate: firstDayOfMonth, endDate: lastDayOfMonth })
        .getRawOne();

      monthlyRevenues.push({ month: targetDate.getMonth() + 1, revenue: totalRevenue.totalRevenue || 0 });
    }

    return monthlyRevenues.reverse(); 
  }

  async calculateTotalPriceForCompletedGroups(@CurrentUser() user: User): Promise<number> {
    const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } })
    const completedGroups = await this.groupRepository.find({
      where: {
        shop: { id: shop.id },
        status: PositionStatusGroupEnum.COMPLETED,
      },
      relations: ['user_groups'],
    });
    let totalPrice = 0;
    for (const group of completedGroups) {
      for (const userGroup of group.user_groups) {
        totalPrice += userGroup.price;
      }
    }

    return totalPrice;
  }



  async getTotalRevenueForCurrentMonth(@CurrentUser() user: User): Promise<number> {
    const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } })
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const completedGroups = await this.groupRepository.find({
      where: {
        shop: { id: shop.id },
        status: PositionStatusGroupEnum.COMPLETED,
        update_At: Between(firstDayOfMonth, lastDayOfMonth),
      },
      relations: ['user_groups'],
    });
    console.log(completedGroups);


    let totalRevenue = 0;
    for (const group of completedGroups) {
      for (const userGroup of group.user_groups) {
        totalRevenue += userGroup.price;
      }
    }

    return totalRevenue;
  }

  async getTotalOrdersForCurrentMonth(user: User): Promise<number> {
    const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const totalOrders = await this.groupRepository.count({
      where: {
        shop: { id: shop.id },
        status: PositionStatusGroupEnum.COMPLETED,
        update_At: Between(firstDayOfMonth, lastDayOfMonth)
      },
    });

    return totalOrders;
  }

}