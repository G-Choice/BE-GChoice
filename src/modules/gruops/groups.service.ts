import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { Group } from 'src/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    @InjectRepository( Cart_user )
    private readonly  cart_userRepository: Repository< Cart_user >,
  ) { }

  async getAllGroups(@Body() product_id: number): Promise<any> {   
    const groupsByProductId = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.carts', 'carts')
      .addSelect('carts.total_quantity')
      .where('group.product_id = :product_id', { product_id: product_id })
      .getMany();
      return new ResponseItem(groupsByProductId , 'Successfully!');
  }


  async createGroups(data: createGroupDto, @CurrentUser() user: User): Promise<any> {
    const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
    if (!existingUser) {
      throw new Error('User does not exist.');
    }
    const exitingGroup = await this.usergroupRepository
      .createQueryBuilder('user_group')
      .innerJoin('user_group.groups', 'groups')
      .where('groups.product_id = :product_id ', { product_id: data.product_id })
      .andWhere('user_group.user_id = :userId', { userId: user.id })
      .where('user_group.role = :role', { role: PositionGroupEnum.LEADER })
      .getCount();

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
      const newUserGroup = this.usergroupRepository.create({
        user_id: user.id,
        group_id: savedGroup.id,
        role: PositionGroupEnum.LEADER
      });
      await this.usergroupRepository.save(newUserGroup);
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

  async joinGroup(joinGroupDto: JoinGroupDto,  @CurrentUser() user: User): Promise<any> { 
      const existingUserGroup = await this.usergroupRepository.findOne({ where: { group_id: joinGroupDto.group_id, user_id: user.id } });
      if (existingUserGroup) {
        throw new NotFoundException('User already joined this group');
      }
      const newUserGroup = new User_group();
      newUserGroup.group_id = joinGroupDto.group_id;
      newUserGroup.user_id = user.id;
      newUserGroup.role = PositionGroupEnum.MEMBER; 
      await this.usergroupRepository.save(newUserGroup);

      const findCart = await this.cartsRepository.findOne({ where: { id: joinGroupDto.group_id } });
     
      // const newCart_User = this.cart_userRepository.create({
      //   user_id: user.id,
      //   group_id: joinGroupDto.group_id,
      //   total_quantity: joinGroupDto.quantity_product,
      // });
      // await this.groupRepository.save(newCart);
      // return {
      //   message: 'Joined group successfully',
      //   data: newCart,
      // };
  }
  //     return { success: true, message: 'Joined group successfully' };
  
  }


