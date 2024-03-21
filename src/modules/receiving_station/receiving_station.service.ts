import { HttpStatus, Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Receiving_station } from 'src/entities/receiving_station';
import { Repository } from 'typeorm';

import { User } from 'src/entities/User.entity';
import { Group } from 'src/entities/group.entity';
import { User_group } from 'src/entities/user_group.entity';
import { PositionStatusGroupEnum } from 'src/common/enum/enums';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';
import { GetGroupParams } from './dto/get_group.dto';
import { CurrentUser } from '../guards/user.decorator';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class ReceivingStationService {
    constructor(
        @InjectRepository(Receiving_station)
        private readonly receiving_stationRepository: Repository<Receiving_station>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        @InjectRepository(User_group)
        private readonly usergroupRepository: Repository<User_group>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    async getAllReceivingStation(): Promise<any> {
        const receiving_station = await this.receiving_stationRepository.find()
        return {
            data: receiving_station,
            message: 'Get all receiving station successfully',
            statusCode: HttpStatus.OK
        }
    }

    async getGroupByReceivingStation(params: GetGroupParams, user: User): Promise<any> {
        try {
          const page = params.page || 1;
          const take = params.take || 6;
          const skip = (page - 1) * take;
          const user_receivingStation = await this.userRepository.findOne({ where: { id: user.id } });
          if (!user_receivingStation) {
            throw new Error("User not found");
          }
          const receivingStation = await this.receiving_stationRepository.findOne({ where: { user: { id:user_receivingStation.id } } });
          if (!receivingStation) {
            throw new Error("Shop not found");
          }
          const statusGroup = params.status_group || PositionStatusGroupEnum.WAITING_DELIVERY;
          const shippingCode = params.shipping_code || '';
          let query = this.groupRepository
            .createQueryBuilder('group')
            .innerJoinAndSelect('group.receiving_station', 'receivingStation', 'receivingStation.id = :receivingStationId', { receivingStationId: receivingStation.id })
            .leftJoinAndSelect('group.user_groups', 'user_groups')
            .leftJoinAndSelect('group.products', 'product')
            .offset(skip)
            .limit(take);
          if (statusGroup) {
            query = query.where('group.status = :status', { status: statusGroup });
          }
          if (shippingCode) {
            query = query.andWhere('group.shipping_code = :shippingCode', { shippingCode });
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


      async getItemGroups(@Param('group_id') group_id: number, @CurrentUser() user: User): Promise<any> {
        const group = await this.groupRepository.findOne({ where: { id: group_id } });
        const ItemGroups = await this.usergroupRepository
          .createQueryBuilder('user_group')
          .leftJoin('user_group.users', 'users')
          .addSelect(['users.id', 'users.username', 'users.email', 'users.image', 'users.address'])
          .where('user_group.group_id = :groupId', { groupId: group.id })
          .getMany();
        return {
          data: ItemGroups,
          message: 'Successfully!'
        };
      }


      async confirmReceivedItem(id: number): Promise<any> {
        try {
          const user_group = await this.usergroupRepository.findOne({where: {id: id}})
          
          if (!user_group) {
            throw new NotFoundException('User group does not exist.');
          }
          
          user_group.isFetching_items = true; 
          await this.usergroupRepository.save(user_group); 
    
          return {
            message: 'User group confirmed successfully', 
            data: null,
        };
        } catch (error) {
          throw error;
        }
      }
}
