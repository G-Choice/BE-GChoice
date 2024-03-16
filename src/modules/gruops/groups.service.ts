import { Body, Injectable, NotFoundException, Param } from '@nestjs/common';
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
import { log } from 'console';
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
    @InjectRepository(ProductDiscount)
    private readonly ProductDiscountRepository: Repository<ProductDiscount>,
    private readonly firebaseRepository: FirebaseRepository

  ) { }

  async getAllGroups(@Param('product_id') product_id: number, @CurrentUser() user: User): Promise<any> {
    const currentTimestamp = new Date().getTime();

    const groupsByProductId = await this.groupRepository
      .createQueryBuilder('group')
      .where('group.product_id = :product_id', { product_id: product_id })
      .andWhere('group.status = :status', { status: PositionStatusGroupEnum.WAITING_FOR_USER })
      .getMany();

    const userGroups = await this.usergroupRepository
      .createQueryBuilder('user_group')
      .select([
        'user_group.id AS id',
        'user_group.role AS role',
        'user_group.quantity AS quantity',
        'user_group.price AS price',
        'user_group.isPayment AS isPayment',
        'user_group.user_id AS user_id',
        'user_group.group_id AS group_id'
      ])
      .innerJoin('user_group.users', 'users')
      .where('users.id = :userId', { userId: user.id })
      .getRawMany();

    const groupsWithRemainingTime = groupsByProductId.map(group => {
      const isJoined = userGroups.some(userGroup => {
        return userGroup.group_id === group.id;
      });

      const remainingTimeInMilliseconds = group.expiration_time.getTime() - currentTimestamp;
      let remainingHours = remainingTimeInMilliseconds / (1000 * 60 * 60);

      if (remainingHours < 0) {
        remainingHours = 0;
      }

      return {
        ...group,
        remainingHours: remainingHours,
        isJoined: isJoined,
      };
    });

    return new ResponseItem(groupsWithRemainingTime, 'Successfully!');

  }
  async getItemGroups(@Param('group_id') group_id: number, @CurrentUser() user: User): Promise<any> {
    const currentTimestamp = new Date().getTime();
    const group = await this.groupRepository.findOne({ where: { id: group_id } });
    const productByGroup = await this.productRepository.findOne({ where: { groups: { id: group_id } } });
    let remainingHours = (group.expiration_time.getTime() - currentTimestamp) / (1000 * 60 * 60);
    if (remainingHours < 0) {
      remainingHours = 0;
    }
    const ItemGroups = await this.usergroupRepository
      .createQueryBuilder('user_group')
      .leftJoin('user_group.users', 'users')
      .addSelect(['users.id', 'users.username', 'users.email', 'users.image', 'users.address'])
      .where('user_group.group_id = :groupId', { groupId: group.id })
      .getMany();

    let totalPrice = await this.usergroupRepository
      .createQueryBuilder('user_group')
      .select([
        'user_group.id AS id',
        'user_group.price AS price',
        'user_group.quantity AS quantity',
        'user_group.role AS role',
        'user_group.isPayment AS isPayment',
        'user_group.user_id AS user_id',
        'user_group.group_id AS group_id',
      ])
      .where('user_group.group_id = :groupId', { groupId: group.id })
      .andWhere('user_group.user_id = :userId', { userId: user.id })
      .getRawOne();

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
        const newGroup = this.groupRepository.create({
          group_name: data.group_name,
          description: data.description,
          expected_quantity: data.group_size,
          current_quantity: data.quantity_product,
          expiration_time: addHours(new Date(), data.hours),
          status: PositionStatusGroupEnum.WAITING_FOR_USER,
          products: product,
        });
        const savedGroup = await this.groupRepository.save(newGroup);
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
          const newUser_group = new User_group();
          newUser_group.groups = newGroup;
          newUser_group.users = existingUser;
          newUser_group.role = PositionGroupEnum.LEADER
          newUser_group.quantity = data.quantity_product;
          newUser_group.price = (product.price - (product.price * discountPercentage / 100)) * data.quantity_product;
          await this.usergroupRepository.save(newUser_group);
        } else {
          const newUser_group = new User_group();
          newUser_group.groups = newGroup;
          newUser_group.users = existingUser;
          newUser_group.quantity = data.quantity_product;
          newUser_group.role = PositionGroupEnum.LEADER
          newUser_group.price = product.price * data.quantity_product;
          await this.usergroupRepository.save(newUser_group);
        }
        if (savedGroup.current_quantity >= savedGroup.expected_quantity) {
          try {
            await this.firebaseRepository.sendPushNotification(existingUser.fcmToken, {
              title: 'G-Choice notification',
              body: `The group ${product.product_name} has enough participants. Please confirm your order.`
            });
            savedGroup.status = PositionStatusGroupEnum.WAITING_FOR_PAYMENT;
            await this.groupRepository.save(savedGroup);
          } catch (error) {
            console.error('Failed to send Firebase notification:', error);
          }
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
      const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
      if (!existingUser) {
        throw new NotFoundException('User does not exist.');
      }
      const existingUserGroup = await this.usergroupRepository.findOne({ where: { groups: { id: joinGroupDto.group_id }, users: { id: user.id } } });
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

      const notAllowedStatus = [
        'waiting_for_payment',
        'payment_success',
        'confirmation_order',
        'waiting_delivery',
        'done'
      ];
      const findGroup = await this.groupRepository.findOne({ where: { id: joinGroupDto.group_id } });
      if (findGroup && notAllowedStatus.includes(findGroup.status)) {
        throw new Error('Cannot join the group ');
      }
      findGroup.current_quantity += joinGroupDto.quantity_product;
      await this.groupRepository.save(findGroup);

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
          if (findGroup.current_quantity >= discount.minQuantity) {
            discountPercentage = parseFloat(discount.discountPercentage);
            break;
          }
        }

        const newUser_group = new User_group();
        newUser_group.groups = findGroup;
        newUser_group.users = existingUser;
        newUser_group.role = PositionGroupEnum.MEMBER;
        newUser_group.quantity = joinGroupDto.quantity_product;
        newUser_group.price = (product.price - (product.price * discountPercentage / 100)) * joinGroupDto.quantity_product;
        await this.usergroupRepository.save(newUser_group);
        const item_groups = await this.usergroupRepository.find({ where: { groups: { id: findGroup.id } } })
        for (const item_group of item_groups) {
          item_group.price = (product.price - (product.price * discountPercentage / 100)) * item_group.quantity;
          await this.usergroupRepository.save(item_group);
        }
      } else {
        const newUser_group = new User_group();
        newUser_group.groups = findGroup;
        newUser_group.users = existingUser;
        newUser_group.role = PositionGroupEnum.MEMBER;
        newUser_group.quantity = joinGroupDto.quantity_product;
        newUser_group.price = product.price * joinGroupDto.quantity_product;
        await this.usergroupRepository.save(newUser_group);
      }
      if (findGroup.current_quantity >= findGroup.expected_quantity) {
        try {
          const userGroups = await this.usergroupRepository
            .createQueryBuilder('user_group')
            .leftJoin('user_group.users', 'user')
            .select('user.id', 'user_id')
            .where('user_group.group_id = :groupId', { groupId: joinGroupDto.group_id })
            .getRawMany();
          const userGroupIds = userGroups.map(userGroup => userGroup.user_id);
          const users = await this.userRepository.find({ where: { id: In(userGroupIds) } });
          console.log(users);
          for (const user of users) {
            const send = await this.firebaseRepository.sendPushNotification(user.fcmToken, {
              title: 'G-Choice Notification',
              body: `The group ${product.product_name} has expired and has been deleted due to insufficient participants.`
            });
            console.log(send);

          }
          findGroup.status = PositionStatusGroupEnum.WAITING_FOR_PAYMENT;
          await this.groupRepository.save(findGroup);
        } catch (error) {
          console.error('Failed to send Firebase notification:', error);
        }
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
      const user_group = await this.usergroupRepository
        .createQueryBuilder('user_group')
        .select([
          'user_group.id AS id',
          'user_group.role AS role',
          'user_group.quantity AS quantity',
          'user_group.price AS price',
          'user_group.isPayment AS isPayment',
          'user_group.user_id AS user_id',
          'user_group.group_id AS group_id'
        ])
        .innerJoin('user_group.groups', 'group')
        .where('group.id = :groupId', { groupId: group.id })
        .getRawMany()
      const userIds = user_group.map(userGroup => userGroup.user_id);
      const users = await this.userRepository.find({ where: { id: In(userIds) } });
      const product = await this.productRepository.findOne({ where: { groups: { id: group.id } } });
      if (group.expiration_time.getTime() < now) {
        if (group.current_quantity < group.expected_quantity) {
          await this.usergroupRepository.remove(user_group)
          await this.groupRepository.delete(group.id);
          for (const user of users) {
            const send =await this.firebaseRepository.sendPushNotification(user.fcmToken, {
              title: 'G-Choice notification', body: `The group ${product.product_name} has expired and has been deleted due to insufficient participants.`
            })
            console.log(send);
            
          }
        }
      }
    }
  }
}
