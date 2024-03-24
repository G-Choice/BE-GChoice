import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Shop } from 'src/entities/shop.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from 'src/entities/order.entity';
import { User } from 'src/entities/User.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product,Shop,Order,User]),

  ],
  controllers:[OrderController],
  providers: [OrderService],
 
})
export class OrderModule {}
