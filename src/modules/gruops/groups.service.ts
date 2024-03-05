import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { Group } from 'src/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { createGroupDto } from './dto/createGroup.dto';
import { User_group } from 'src/entities/user_group.entity';
import { User } from 'src/entities/User.entity';
import { Product } from 'src/entities/product.entity';
import { addHours } from 'date-fns';
import { PositionEnum, PositionGroupEnum } from 'src/common/enum/enums';
import { CurrentUser } from '../guards/user.decorator';
import { ResponseItem } from 'src/common/dtos/responseItem';
import { JoinGroupDto } from './dto/join_group.dto';
import { Carts } from 'src/entities/cart.entity';
import { Cart_user } from 'src/entities/cart_user.entyti';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { FirebaseRepository } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { Cron, CronExpression } from '@nestjs/schedule';
import { log } from 'console';
@Injectable()
export class GruopsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(User_group)
    private readonly usergroupRepository: Repository<User_group>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
    @InjectRepository(Cart_user)
    private readonly cart_userRepository: Repository<Cart_user>,
    @InjectRepository(ProductDiscount)
    private readonly ProductDiscountRepository: Repository<ProductDiscount>,
    private readonly firebaseRepository: FirebaseRepository

  ) { }

  async getAllGroups(@Body() product_id: number): Promise<any> {
    const currentTimestamp = new Date().getTime(); // Thời gian hiện tại

    const groupsByProductId = await this.groupRepository
      .createQueryBuilder('group')
      .addSelect('group.groupTime')
      .leftJoin('group.carts', 'carts')
      .addSelect('carts.total_quantity')
      .where('group.product_id = :product_id', { product_id: product_id })
      .andWhere('group.groupTime > :currentTimestamp', { currentTimestamp: new Date() })
      .getMany();
    const groupsWithRemainingTime = groupsByProductId.map(group => {
      const remainingTimeInMilliseconds = group.groupTime.getTime() - currentTimestamp;
      const remainingHours = remainingTimeInMilliseconds / (1000 * 60 * 60);
      return {
        ...group,
        remainingHours: remainingHours
      };
    });

    return new ResponseItem(groupsWithRemainingTime, 'Successfully!');
  }

  async getCartGroups(group_id: number): Promise<any> {
    const findCart = await this.cartsRepository.findOne({ where: { groups: { id: group_id } } });
    const cartGroups = await this.cart_userRepository
      .createQueryBuilder('cart_user')
      .leftJoin('cart_user.users', 'users')
      .addSelect(['users.id', 'users.username', 'users.email', 'users.image', 'users.address'])
      .where('cart_user.cart_id = :cartId', { cartId: findCart.id })
      .getMany();
    const totalPrice = cartGroups.reduce((total, group) => total + group.price, 0);
    return {
      data: cartGroups, totalPrice,
      message: 'Successfully!'
    };
  }
  async createGroups(data: createGroupDto, @CurrentUser() user: User): Promise<any> {
    const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
    console.log(existingUser);

    if (!existingUser) {
      throw new NotFoundException('User does not exist.');
    }
    const exitingGroup = await this.usergroupRepository
      .createQueryBuilder('user_group')
      .innerJoin('user_group.groups', 'groups')
      .where('groups.product_id = :product_id ', { product_id: data.product_id })
      .andWhere('user_group.user_id = :userId', { userId: user.id })
      .andWhere('user_group.role = :role', { role: PositionGroupEnum.LEADER })
      .getCount();
    console.log(exitingGroup);

    if (exitingGroup < 1) {
      const product = await this.productRepository.findOne({ where: { id: data.product_id } });
      if (!product) {
        throw new Error('Product not found');
      }
      const newGroup = this.groupRepository.create({
        group_name: data.group_name,
        description: data.description,
        groupSize: data.group_size,
        groupTime: addHours(new Date(), data.hours),
        products: product,
      });

      const savedGroup = await this.groupRepository.save(newGroup);

      const newCart = new Carts();
      newCart.total_price = 0;
      newCart.total_quantity = data.quantity_product;
      newCart.groups = savedGroup;
      await this.cartsRepository.save(newCart);

      const newUserGroup = this.usergroupRepository.create({
        user_id: user.id,
        group_id: savedGroup.id,
        role: PositionGroupEnum.LEADER
      });
      await this.usergroupRepository.save(newUserGroup);
      const product_discounts = await this.ProductDiscountRepository.find({
        where: {
          products: {
            id: data.product_id
          }
        }
      });
      if (product_discounts && product_discounts.length > 0) {
        product_discounts.sort((a, b) => b.minQuantity - a.minQuantity);
        let discountPercentage = 0;
        for (const discount of product_discounts) {
          if (data.quantity_product >= discount.minQuantity) {
            discountPercentage = parseFloat(discount.discountPercentage);
            break;
          }
        }
        const newCart_user = new Cart_user();
        newCart_user.cart_id = newCart.id;
        newCart_user.user_id = user.id;
        newCart_user.quantity = data.quantity_product;
        newCart_user.price = (product.price - (product.price * discountPercentage / 100)) * data.quantity_product;
        await this.cart_userRepository.save(newCart_user);


      } else {
        const newCart_user = new Cart_user();
        newCart_user.cart_id = newCart.id;
        newCart_user.user_id = user.id;
        newCart_user.quantity = data.quantity_product;
        newCart_user.price = product.price * data.quantity_product;
        await this.cart_userRepository.save(newCart_user);
      }
      return {
        message: 'Group created successfully!',
        data: savedGroup,
      };
    } else {
      return {
        message: 'Group already exists ',
        data: null,
      }

    }
  }

  async joinGroup(joinGroupDto: JoinGroupDto, @CurrentUser() user: User): Promise<any> {
    const existingUserGroup = await this.usergroupRepository.findOne({ where: { group_id: joinGroupDto.group_id, user_id: user.id } });
    if (existingUserGroup) {
      throw new NotFoundException('User already joined this group');
    }
    const newUserGroup = new User_group();
    newUserGroup.group_id = joinGroupDto.group_id;
    newUserGroup.user_id = user.id;
    newUserGroup.role = PositionGroupEnum.MEMBER;
    await this.usergroupRepository.save(newUserGroup);

    const findCart = await this.cartsRepository.findOne({ where: { groups: { id: joinGroupDto.group_id } } });
    findCart.total_quantity += joinGroupDto.quantity_product;
    await this.cartsRepository.save(findCart);

    const product = await this.productRepository.findOne({
      where: {
        groups: {
          id: joinGroupDto.group_id
        }
      }
    });
    const product_discounts = await this.ProductDiscountRepository.find({
      where: {
        products: {
          id: product.id
        }
      }
    });
    if (product_discounts && product_discounts.length > 0) {
      product_discounts.sort((a, b) => b.minQuantity - a.minQuantity);
      let discountPercentage = 0;
      for (const discount of product_discounts) {
        if (findCart.total_quantity >= discount.minQuantity) {
          discountPercentage = parseFloat(discount.discountPercentage);
          break;
        }
      }
      const newCart_user = new Cart_user();
      newCart_user.cart_id = findCart.id;
      newCart_user.user_id = user.id;
      newCart_user.quantity = joinGroupDto.quantity_product;
      newCart_user.price = (product.price - (product.price * discountPercentage / 100)) * joinGroupDto.quantity_product;
      await this.cart_userRepository.save(newCart_user);

      const cart_users = await this.cart_userRepository.find({ where: { cart_id: findCart.id } })
      for (const cart_user of cart_users) {
        cart_user.price = (product.price - (product.price * discountPercentage / 100)) * cart_user.quantity;
        await this.cart_userRepository.save(cart_user);
      }
    } else {
      const newCart_user = new Cart_user();
      newCart_user.cart_id = findCart.id;
      newCart_user.user_id = user.id;
      newCart_user.quantity = joinGroupDto.quantity_product;
      newCart_user.price = product.price * joinGroupDto.quantity_product;
      await this.cart_userRepository.save(newCart_user);
    }
    return {
      message: 'Joined group successfully',
      data: null,
    };
  }

  // async sendNotificationToToken() {
  //   const token = 'fSdqVbBPR7CJJIQCVs-bs5:APA91bEZbUEw9RKld5LExYe9lSpVwd4eIyebSFQOVLzRsaWikT8pmz-xfGYsMXacaBTik-r5dijpk6Y9fS4jATMQ4eTPaXQkurxjy90gHNhPFHxpWqen-60qa3o-6w-I0tSaLI56NUd7';
  //   const notification: admin.messaging.Notification = {
  //     title: 'Your notification title',
  //     body: 'Your notification body',
  //   };
  //   const data: admin.messaging.DataMessagePayload = {
  //     // optional data payload
  //     // add any custom data you want to send with your notification
  //   };

  //   try {
  //     const response = await this.firebaseRepository.sendPushNotification(token, notification);
  //     console.log('Push notification sent successfully:', response);
  //   } catch (error) {
  //     console.error('Failed to send push notification:', error);
  //   }
  // }


  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndProcessExpiredGroups() {
    const groups = await this.groupRepository.find();
    for (const group of groups) {
      const groupTime = new Date(group.groupTime);
      if (groupTime.getTime() < new Date().getTime()) {
        const user_group = await this.usergroupRepository.find({ where: { group_id: group.id } });
        const userIds = user_group.map(userGroup => userGroup.user_id);
        const users = await this.userRepository.find({ where: { id: In(userIds) } });
        const cart = await this.cartsRepository.findOne({ where: { groups: { id: group.id } } });      
        const cart_user = await this.cart_userRepository.find({ where: { carts: { id: cart.id } } });
        if (cart.total_quantity < group.groupSize) {
          await this.usergroupRepository.delete({ group_id: group.id });
          await this.cartsRepository.delete({ groups: { id: group.id } });
          await this.groupRepository.delete(group.id);
          // await this.cartsRepository.delete
          console.log("Expired group processed and deleted.");
        } else {
          // Gửi thông báo đến leader của nhóm để xác nhận đơn hàng
          console.log(`Group ${group.group_name} is ready for order confirmation. Notification sent to leader.`);
        }
      }
    }
  }
}