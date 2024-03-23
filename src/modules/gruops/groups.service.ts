import { Body, HttpCode, HttpStatus, Injectable, NotFoundException, Param } from '@nestjs/common';
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
import { ProductDiscount } from 'src/entities/product_discount.entity';
import { FirebaseRepository } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { Cron, CronExpression } from '@nestjs/schedule';
import { group, log } from 'console';
import { SaveDataPayemntDto } from './dto/save_dataPayment.dto';
import { Shop } from 'src/entities/shop.entity';
import { GetGroupParams } from './dto/get_group.dto';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';
import { Receiving_station } from 'src/entities/receiving_station';
import { randomInt } from 'crypto';
import { GetGroupByUserParams } from './dto/getGroupByUser.dto';
import { Notifications } from 'src/entities/notification.entity';
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
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(ProductDiscount)
    private readonly ProductDiscountRepository: Repository<ProductDiscount>,
    @InjectRepository(Receiving_station)
    private readonly receiving_stationRepository: Repository<Receiving_station>,
    @InjectRepository(Notifications)
    private readonly notificationsRepository: Repository<Notifications>,
    private readonly firebaseRepository: FirebaseRepository

  ) { }

  async getAllGroups(@Param('product_id') product_id: number, params: GetGroupByUserParams, @CurrentUser() user: User): Promise<any> {
    const currentTimestamp = new Date().getTime();

    let groupsByProductId: any[];

    if (params.receiving_station_id) {
      groupsByProductId = await this.groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.receiving_station', 'receiving_station')
        .where('group.product_id = :product_id', { product_id: product_id })
        .andWhere('group.receivingStation_id = :receiving_station_id', { receiving_station_id: params.receiving_station_id })
        .andWhere('group.status IN (:...statuses)', { statuses: [PositionStatusGroupEnum.WAITING_FOR_USER] })
        .getMany();
    } else {
      groupsByProductId = await this.groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.receiving_station', 'receiving_station')
        .where('group.product_id = :product_id', { product_id: product_id })
        .andWhere('group.status IN (:...statuses)', { statuses: [PositionStatusGroupEnum.WAITING_FOR_USER] })
        .getMany();
    }

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
    const receingStation = await this.receiving_stationRepository.findOne({ where: { group: { id: group.id } } });
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
      receingStation,
      totalPrice,
      remainingHours,
      productByGroup,
      message: 'Successfully!'
    };
  }

  async getGroupsByShop(params: GetGroupParams, user: User): Promise<any> {
    try {
      const page = params.page || 1;
      const take = params.take || 6;
      const skip = (page - 1) * take;
      const userShop = await this.userRepository.findOne({ where: { id: user.id } });
      if (!userShop) {
        throw new Error("User not found");
      }

      const shop = await this.shopRepository.findOne({ where: { user: { id: userShop.id } } });
      if (!shop) {
        throw new Error("Shop not found");
      }
      // Thiết lập trạng thái mặc định nếu params.status_group không được chỉ định
      const statusGroup = params.status_group || PositionStatusGroupEnum.WAITING_CONFIRMATION_ORDER;
      let query = this.groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.receiving_station', 'receiving_station')
        .leftJoinAndSelect('group.user_groups', 'user_groups')
        .leftJoinAndSelect('group.products', 'product')
        .offset(skip)
        .limit(take);
      // Áp dụng điều kiện where nếu trạng thái nhóm đã được chỉ định
      if (statusGroup) {
        query = query.where('group.status = :status', { status: statusGroup });
      }
      const [groups, total] = await query.getManyAndCount();
      const pageMetaDto = new PageMetaDto({
        pageOptionsDto: params,
        itemCount: total,
      });
      return new ResponsePaginate(groups, pageMetaDto, 'Success');
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null
      };
    }
  }

  async getStatusGroups(group_id: number): Promise<any> {
    try {
      const group = await this.groupRepository
        .createQueryBuilder("group")
        .leftJoinAndSelect("group.products", "product")
        .where("group.id = :groupId", { groupId: group_id })
        .getOne();
      if (!group) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Group not found.",
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: "Group status retrieved successfully.",
        data: group
      };
    } catch (error) {
      throw new Error("Error retrieving group status.");
    }
  }


  async getAllGroupsbyUser(user: User): Promise<any> {
    try {
      const currentTimestamp = new Date().getTime();
      const user_group = await this.usergroupRepository
        .createQueryBuilder("user_group")
        .select([
          'user_group.id AS id',
          'user_group.role AS role',
          'user_group.quantity AS quantity',
          'user_group.price AS price',
          'user_group.isPayment AS isPayment',
          'user_group.user_id AS user_id',
          'user_group.group_id AS group_id'
        ])
        .innerJoin("user_group.groups", "group")
        .where("user_group.users.id = :userId", { userId: user.id })
        .getRawMany();
      console.log(user_group);

      const group_ids = user_group.map(userGroup => userGroup.group_id);
      console.log(group_ids);
      const groups = await this.groupRepository
        .createQueryBuilder("group")
        .select([
          'group.id AS id',
          'group.group_name AS group_name',
          'group.description AS description',
          'group.image AS image',
          'group.expected_quantity AS expected_quantity',
          'group.current_quantity AS current_quantity',
          'group.isConfirm AS isConfirm',
          'group.expiration_time AS expiration_time',
          'group.create_At AS create_At',
          'group.shipping_code AS shipping_code',
          'group.status AS status',
          'group.update_At AS update_At',
          'group.product_id AS product_id',
          'group.receivingStation_id AS receivingStation_id',
        ])
        .where("group.id IN (:...groupIds)", { groupIds: group_ids })
        .getRawMany();
      console.log(groups);
      // Finding products associated with groups
      const productIds = groups.map(group => group.product_id);
      const products = await this.productRepository
        .createQueryBuilder("product")
        .where("product.id IN (:...productIds)", { productIds: productIds })
        .getMany();
      // Lấy danh sách id của các trạm tương ứng
      const receivingStationIds = groups.map(group => group.receivingstation_id);
      console.log(receivingStationIds);

      const receivingStations = await this.receiving_stationRepository
        .createQueryBuilder("receivingStation")
        .where("receivingStation.id IN (:...receivingStationIds)", { receivingStationIds: receivingStationIds })
        .getMany();
      console.log(receivingStations);

      groups.forEach(group => {
        group.products = products.filter(product => product.id === group.product_id);
        // Thêm thông tin trạm vào nhóm
        group.receivingStation = receivingStations.find(station => station.id === group.receivingstation_id);
        let remainingHours = (group.expiration_time.getTime() - currentTimestamp) / (1000 * 60 * 60);
        group.remainingHours = remainingHours < 0 ? 0 : remainingHours; // Add remainingHours to group
      });

      return {
        statusCode: HttpStatus.OK,
        message: "Groups retrieved successfully.",
        data: groups
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message
      };
    }
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
      const shop = await this.shopRepository.findOne({ where: { products: { id: product.id } } });
      if (!shop) {
        throw new Error('Shop not found');
      }
      const receingStation = await this.receiving_stationRepository.findOne({ where: { id: data.receingStation_id } });
      if (!receingStation) {
        throw new Error('ReceingStation not found');
      }
      const exitingGroup = await this.usergroupRepository
        .createQueryBuilder('user_group')
        .innerJoin('user_group.groups', 'groups')
        .where('groups.product_id = :product_id ', { product_id: data.product_id })
        .andWhere('user_group.user_id = :userId', { userId: user.id })
        .andWhere('user_group.role = :role', { role: PositionGroupEnum.LEADER })
        .getCount();

      if (exitingGroup < 1) {
        const randomCode = '#' + (100000 + randomInt(900000)).toString().slice(1);
        const newGroup = this.groupRepository.create({
          group_name: data.group_name,
          description: data.description,
          expected_quantity: data.group_size,
          current_quantity: data.quantity_product,
          expiration_time: addHours(new Date(), data.hours),
          status: PositionStatusGroupEnum.WAITING_FOR_USER,
          products: product,
          shop: shop,
          receiving_station: receingStation,
          shipping_code: randomCode,
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
              body: `The group ${product.product_name} has enough participants. Please proceed to payment for your order.`
            });
            savedGroup.status = PositionStatusGroupEnum.WAITING_FOR_PAYMENT;
            await this.groupRepository.save(savedGroup);

            const newNotificaton = new Notifications();
            newNotificaton.title = 'G-Choice notification';
            newNotificaton.body = `The group ${product.product_name} has enough participants. Please proceed to payment for your order.`;
            newNotificaton.user = existingUser;
            await this.notificationsRepository.save(newNotificaton);
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
        throw new Error('Group not found');
      }
      if (product.status === 'maintaining') {
        throw new Error('This product is currently under maintenance. Please try again later.');
      }

      const notAllowedStatus = [
        'waiting_for_payment',
        'waiting_confirmation_order',
        'waiting_delivery',
        'fetching_items',
        'completed',
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
        const item_groups = await this.usergroupRepository.find({ where: { groups: { id: joinGroupDto.group_id } } })
        console.log('====================================');
        console.log(item_groups );
        console.log('====================================');
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
              body: `The group ${product.product_name} has enough participants. Please proceed to payment for your order.`
            });
            console.log(send);
            const newNotificaton = new Notifications();
            newNotificaton.title = 'G-Choice notification';
            newNotificaton.body = `The group ${product.product_name} has enough participants. Please proceed to payment for your order.`;
            newNotificaton.user = user;
            await this.notificationsRepository.save(newNotificaton);
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

  async removeUserFromGroup(group_id: number, user: User): Promise<any> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
      if (!existingUser) {
        throw new NotFoundException('User does not exist.');
      }
      const notAllowedStatus = [
        'waiting_for_payment',
        'waiting_confirmation_order',
        'waiting_delivery',
        'fetching_items',
        'completed',
      ];
      const findGroup = await this.groupRepository.findOne({ where: { id: group_id } });
      if (findGroup && notAllowedStatus.includes(findGroup.status)) {
        throw new Error('Cannot remove the group');
      }
      const existingUserGroup = await this.usergroupRepository.findOne({ where: { groups: { id: group_id }, users: { id: user.id } } });
      if (existingUserGroup) {
        findGroup.current_quantity -= existingUserGroup.quantity;
        await this.groupRepository.save(findGroup);
        await this.usergroupRepository.delete(existingUserGroup.id);
      } else {
        throw new NotFoundException('You have not joined this group.');
      }
      return {
        message: 'User removed from group successfully',
        data: null,
      };
    } catch (error) {
      return {
        message: error.message || 'Failed to remove user from group',
        data: null,
      };
    }
  }
  async deleteGroup(group_id: number, user: User): Promise<any> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
      if (!existingUser) {
        throw new NotFoundException('User does not exist.');
      }
        const existingUserGroup = await this.usergroupRepository.findOne({ where: { groups: { id: group_id }, users: { id: user.id }, role: PositionGroupEnum.LEADER } });
        if (!existingUserGroup) {
            throw new Error('Only group leaders can delete the group');
        }
      const notAllowedStatus = [
        'waiting_for_payment',
        'waiting_confirmation_order',
        'waiting_delivery',
        'fetching_items',
        'completed',
      ];
      const findGroup = await this.groupRepository.findOne({ where: { id: group_id } });
      if (findGroup && notAllowedStatus.includes(findGroup.status)) {
        throw new Error('Cannot delete the group');
      }
      const existingUserGroups = await this.usergroupRepository.find({ where: { groups: { id: group_id } }});
      await Promise.all(existingUserGroups.map(async (userGroup) => {
        await this.usergroupRepository.remove(userGroup); 
    }));
    await this.groupRepository.delete(group_id);
      return {
        message: 'delete group successfully',
        data: null,
      };
    } catch (error) {
      return {
        message: error.message || 'Failed to delete group',
        data: null,
      };
    }
  }


  async confirmOrder(id: number, user: User): Promise<any> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
      if (!existingUser) {
        throw new NotFoundException('User does not exist.');
      }
      const existingShop = await this.shopRepository.findOne({ where: { id: existingUser.id } });
      if (!existingShop) {
        throw new NotFoundException('Shop does not exist.');
      }
      const group = await this.groupRepository
        .createQueryBuilder("group")
        .where("group.id = :id", { id: id })
        .getRawOne();
      if (!group) {
        throw new NotFoundException('Group not found');
      }

      if (group.group_shop_id !== existingShop.id) {
        throw new Error('You do not have permission to confirm this order.');
      }
      await this.groupRepository.update({ id: id }, { isConfirm: true, status: PositionStatusGroupEnum.WAITING_DELIVERY });
      const product = await this.productRepository.findOne({ where: { groups: { id: group.id } } });
      console.log(product);
      const userGroups = await this.usergroupRepository
        .createQueryBuilder('user_group')
        .leftJoin('user_group.users', 'user')
        .select('user.id', 'user_id')
        .where('user_group.group_id = :groupId', { groupId: group.group_id })
        .getRawMany();
      const userGroupIds = userGroups.map(userGroup => userGroup.user_id);
      const users = await this.userRepository.find({ where: { id: In(userGroupIds) } });
      console.log(users);
      for (const user of users) {
        const send = await this.firebaseRepository.sendPushNotification(user.fcmToken, {
          title: 'G-Choice Notification',
          body: `The group for ${product.product_name} has been confirmed.`
        });
        console.log(send);
        const newNotificaton = new Notifications();
        newNotificaton.title = 'G-Choice notification';
        newNotificaton.body = `The group for ${product.product_name} has been confirmed.`;
        newNotificaton.user = user;
        await this.notificationsRepository.save(newNotificaton);
      };

      return {
        message: 'Group confirmed successfully',
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async saveDataPayment(@Body() saveDataPaymentDto: SaveDataPayemntDto, user: User): Promise<any> {
    const group = await this.groupRepository.findOne({ where: { id: saveDataPaymentDto.group_id } })
    if (!group) {
      throw new Error("Group not found");
    }
    console.log(group);
    const userGroup = await this.usergroupRepository.findOne({ where: { users: { id: user.id }, groups: { id: saveDataPaymentDto.group_id } } });
    console.log(userGroup);

    if (userGroup) {
      userGroup.isPayment = true;
      await this.usergroupRepository.save(userGroup);
    } else {
      throw new Error("User group not found");
    }
    const userGroups = await this.usergroupRepository.find({ where: { groups: { id: group.id } } });
    const allUsersPaid = userGroups.every(userGroup => userGroup.isPayment);
    if (allUsersPaid) {
      group.status = PositionStatusGroupEnum.WAITING_CONFIRMATION_ORDER;
      await this.groupRepository.save(group);
    }
    return {
      message: "Data payment saved successfully",
      status: 200,
      data: null
    };
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
            const send = await this.firebaseRepository.sendPushNotification(user.fcmToken, {
              title: 'G-Choice notification',
              body: `The group ${product.product_name} has expired and has been deleted due to insufficient participants.`
            })
            console.log(send);
            const newNotificaton = new Notifications();
            newNotificaton.title = 'G-Choice notification';
            newNotificaton.body = `The group ${product.product_name} has expired and has been deleted due to insufficient participants.`;
            newNotificaton.user = user;
            await this.notificationsRepository.save(newNotificaton);
          }
        }
      }
    }
  }

}