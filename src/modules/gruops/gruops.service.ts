import { Injectable } from '@nestjs/common';
import { GruopsController } from './gruops.controller';
import { Group } from 'src/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createGroupDto } from './dto/createGroup.dto';
import { User_group } from 'src/entities/user_group.entity';
import { User } from 'src/entities/User.entity';
import { Product } from 'src/entities/product.entity';
import { addHours } from 'date-fns';
import { PositionGroupEnum } from 'src/common/enum/enums';
import { CurrentUser } from '../guards/user.decorator';
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

  ) { }
  async createGroups(data: createGroupDto, @CurrentUser() user: User): Promise<any> {
    const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
    if (!existingUser) {
      throw new Error('User does not exist.');
    }
    const exitingGroup = await this.usergroupRepository
      .createQueryBuilder('user_group')
      .innerJoin('user_group.groups', 'groups')
      .where('groups.product_id = :productId', { productId: data.product_id })
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
}