import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { Group } from 'src/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { createGroupDto } from './dto/createGroup.dto';
import { User_group } from 'src/entities/user_group.entity';
import { User } from 'src/entities/User.entity';
import { Product } from 'src/entities/product.entity';
import { addHours } from 'date-fns';
import { PositionEnum, PositionGroupEnum, PositionStatusGroupEnum } from 'src/common/enum/enums';
import { CurrentUser } from '../guards/user.decorator';
import { ResponseItem } from 'src/common/dtos/responseItem';
import { JoinGroupDto } from './dto/join_group.dto';
// import { Carts } from 'src/entities/cart.entity';
// import { Cart_user } from 'src/entities/cart_user.entyti';
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { FirebaseRepository } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { Cron, CronExpression } from '@nestjs/schedule';
// import { Group_user_product } from 'src/entities/group_user_product.entity';

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
    // @InjectRepository(Carts)
    // private readonly cartsRepository: Repository<Carts>,
    // @InjectRepository(Cart_user)
    // private readonly cart_userRepository: Repository<Cart_user>,
    // @InjectRepository(Group_user_product)
    // private readonly group_user_productRepository: Repository<Group_user_product>,
    @InjectRepository(ProductDiscount)
    private readonly ProductDiscountRepository: Repository<ProductDiscount>,
    private readonly firebaseRepository: FirebaseRepository

  ) { }

  async getAllGroups(@Body() product_id: number, @CurrentUser() user: User): Promise<any> {
    const currentTimestamp = new Date().getTime();
    const groupsByProductId = await this.groupRepository
      .createQueryBuilder('group')
      .addSelect('group.groupTime')
      .leftJoin('group.users', 'users', 'users.id = :userId', { userId: user.id })
      .addSelect('users.id')
      .where('group.product_id = :product_id', { product_id: product_id })
      .getMany();

    const groupsWithRemainingTime = groupsByProductId.map(group => {
      const remainingTimeInMilliseconds = group.groupTime.getTime() - currentTimestamp;
      let remainingHours = remainingTimeInMilliseconds / (1000 * 60 * 60);

      if (remainingHours < 0) {
        remainingHours = 0;
      }

      const isJoined = group.users.length > 0;
      return {
        ...group,
        remainingHours: remainingHours,
        isJoined: isJoined

      };
    });

    return new ResponseItem(groupsWithRemainingTime, 'Successfully!');

  }
  async getCartGroups(group_id: number, @CurrentUser() user: User): Promise<any> {
    const currentTimestamp = new Date().getTime();
    const group = await this.groupRepository.findOne({ where: { id: group_id } });
    const productByGroup = await this.productRepository.findOne({ where: { groups: { id: group_id } } });
    // const group = await this.groupRepository.findOne({ where: { id: group_id } });
    let remainingHours = (group.groupTime.getTime() - currentTimestamp) / (1000 * 60 * 60);
    if (remainingHours < 0) {
      remainingHours = 0;
    }

    const ItemGroups = await this.usergroupRepository
      .createQueryBuilder('user_group')
      .leftJoin('group_user_product.users', 'users')
      .addSelect(['users.id', 'users.username', 'users.email', 'users.image', 'users.address'])
      .where('group_user_product.group_id = :groupId', { groupId: group.id })
      .getMany();

    let totalPrice = await this.group_user_productRepository
      .createQueryBuilder('group_user_product')
      .addSelect('group_user_product.price')
      .where('group_user_product.group_id = :groupId', { groupId: group.id })
      .andWhere('group_user_product.user_id = :userId', { userId: user.id })
      .getOne();

    if (!totalPrice) {
      totalPrice = null;
    }

    return {
      data: ItemGroups,
      totalPrice,
      remainingHours,
      productByGroup,
      message: 'Successfully!'
    };
  }

  async createGroups(data: createGroupDto, @CurrentUser() user: User): Promise<any> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
      if (!existingUser) {
        throw new NotFoundException('User does not exist.');
      }

      const product = await this.productRepository.findOne({ where: { id: data.product_id } });
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.status === 'maintaining') {
        throw new Error('This product is currently under maintenance. Please try again later.');
      }
      const exitingGroup = await this.usergroupRepository
        .createQueryBuilder('user_group')
        .innerJoin('user_group.groups', 'groups')
        .where('groups.product_id = :product_id ', { product_id: data.product_id })
        .andWhere('user_group.user_id = :userId', { userId: user.id })
        .andWhere('user_group.role = :role', { role: PositionGroupEnum.LEADER })
        .getCount();

      if (exitingGroup < 1) {
        // const product = await this.productRepository.findOne({ where: { id: data.product_id } });
        // if (!product) {
        //   throw new Error('Product not found');
        // }
        const newGroup = this.groupRepository.create({
          group_name: data.group_name,
          description: data.description,
          groupSize: data.group_size,
          groupTime: addHours(new Date(), data.hours),
          status: PositionStatusGroupEnum.WAITING_FOR_USER,
          // total_price :0,
          total_quantity: data.quantity_product,
          products: product,
        });
        const savedGroup = await this.groupRepository.save(newGroup);
        // const newCart = new Carts();
        // newCart.total_price = 0;
        // newCart.total_quantity = data.quantity_product;
        // newCart.groups = savedGroup;
        // await this.cartsRepository.save(newCart);

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
          const newGroup_user_product = new Group_user_product();
          newGroup_user_product.group_id = savedGroup.id;
          newGroup_user_product.user_id = user.id;
          newGroup_user_product.quantity = data.quantity_product;
          newGroup_user_product.price = (product.price - (product.price * discountPercentage / 100)) * data.quantity_product;
          await this.group_user_productRepository.save(newGroup_user_product);


        } else {
          const newGroup_user_product = new Group_user_product();
          newGroup_user_product.group_id = savedGroup.id;
          newGroup_user_product.user_id = user.id;
          newGroup_user_product.quantity = data.quantity_product;
          newGroup_user_product.price = product.price * data.quantity_product;
          await this.group_user_productRepository.save(newGroup_user_product);
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
    } catch (error) {
      return {
        message: error.message || 'Failed to create group',
        data: null,
      };
    }
  }

  async joinGroup(joinGroupDto: JoinGroupDto, @CurrentUser() user: User): Promise<any> {
    try {
      const existingUserGroup = await this.usergroupRepository.findOne({ where: { group_id: joinGroupDto.group_id, user_id: user.id } });
      if (existingUserGroup) {
        throw new NotFoundException('User already joined this group');
      }

      const product = await this.productRepository.findOne({
        where: {
          groups: {
            id: joinGroupDto.group_id
          }
        }
      });
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.status === 'maintaining') {
        throw new Error('This product is currently under maintenance. Please try again later.');
      }
      const newUserGroup = new User_group();
      newUserGroup.group_id = joinGroupDto.group_id;
      newUserGroup.user_id = user.id;
      newUserGroup.role = PositionGroupEnum.MEMBER;
      await this.usergroupRepository.save(newUserGroup);
      const findGroup = await this.groupRepository.findOne({ where: { id: joinGroupDto.group_id } });
      findGroup.total_quantity += joinGroupDto.quantity_product;
      await this.groupRepository.save(findGroup);

      // const product = await this.productRepository.findOne({
      //   where: {
      //     groups: {
      //       id: joinGroupDto.group_id
      //     }
      //   }
      // });
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
          if (findGroup.total_quantity >= discount.minQuantity) {
            discountPercentage = parseFloat(discount.discountPercentage);
            break;
          }
        }

        const newGroup_user_product = new Group_user_product();
        newGroup_user_product.group_id = findGroup.id;
        newGroup_user_product.user_id = user.id;
        newGroup_user_product.quantity = joinGroupDto.quantity_product;
        newGroup_user_product.price = (product.price - (product.price * discountPercentage / 100)) * joinGroupDto.quantity_product;
        await this.group_user_productRepository.save(newGroup_user_product);

        const item_groups = await this.group_user_productRepository.find({ where: { group_id: findGroup.id } })
        for (const item_group of item_groups) {
          item_group.price = (product.price - (product.price * discountPercentage / 100)) * item_group.quantity;
          await this.group_user_productRepository.save(item_group);
        }
      } else {
        const newGroup_user_product = new Group_user_product();
        newGroup_user_product.group_id = findGroup.id;
        newGroup_user_product.user_id = user.id;
        newGroup_user_product.quantity = joinGroupDto.quantity_product;
        newGroup_user_product.price = product.price * joinGroupDto.quantity_product;
        await this.group_user_productRepository.save(newGroup_user_product);
      }
      return {
        message: 'Joined group successfully',
        data: null,
      };
    } catch (error) {
      return {
        message: error.message || 'Failed to create group',
        data: null,
      };
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndProcessExpiredGroups() {
    const now = new Date().getTime();
    const groups = await this.groupRepository.find({ where: { status: PositionStatusGroupEnum.WAITING_FOR_USER } });
    for (const group of groups) {
      const user_group = await this.usergroupRepository.find({ where: { group_id: group.id } });
      const userIds = user_group.map(userGroup => userGroup.user_id);
      const users = await this.userRepository.find({ where: { id: In(userIds) } });
      const product = await this.productRepository.findOne({ where: { groups: { id: group.id } } });
      if (group.groupTime.getTime() < now) {
        if (group.total_quantity < group.groupSize) {
          await this.group_user_productRepository.delete({ groups: { id: group.id } });
          await this.usergroupRepository.delete({ group_id: group.id });
          await this.groupRepository.delete(group.id);
          for (const user of users) {
            await this.firebaseRepository.sendPushNotification(user.fcmToken, {
              title: 'G-Choice notification', body: `The group ${product.product_name} has expired and has been deleted due to insufficient participants.`
            })
          }
        }
      }
      else {
        if (group.total_quantity >= group.groupSize) {
          await this.groupRepository.update(group.id, { status: PositionStatusGroupEnum.WAITING_FOR_PAYMENT });
          for (const user of users) {
            await this.firebaseRepository.sendPushNotification(user.fcmToken, { title: 'G-Choice notification', body: `The group ${product.product_name} has enough participants. Please confirm your order.` });
          }
        }

      }
    }
  }
}

