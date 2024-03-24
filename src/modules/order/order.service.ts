import { Body, Injectable } from '@nestjs/common';
import { SaveDataDto } from './dto/saveData.dto';
import { User } from 'src/entities/User.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/entities/product.entity';
import { PositionStatusGroupEnum } from 'src/common/enum/enums';
import { Shop } from 'src/entities/shop.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
    ) { }


    async saveData(saveDataDto: SaveDataDto, user: User): Promise<any> {
        try {
            const product = await this.productRepository.findOne({ where: { id: saveDataDto.product_id } });
            if (!product) {
                throw new Error("Product not found");
            }
            const shop = await this.shopRepository.findOne({ where: { products: { id: saveDataDto.product_id} } });
            if (!shop) {
                throw new Error("Shop not found");
            }
            const userpayment = await this.userRepository.findOne({ where: { id: user.id } });
            if (!userpayment) {
                throw new Error("User not found");
            }
            const quantity = saveDataDto.total_price / product.price;
            const newOrder = this.orderRepository.create({
                total: saveDataDto.total_price,
                quantity: quantity,
                recipientAddress: saveDataDto.deliveryAddress,
                recipientPhoneNumber: saveDataDto.phoneNumber,
                status: PositionStatusGroupEnum.WAITING_CONFIRMATION_ORDER,
                isPayment:true,
                product: product,
                user: userpayment,
                shop: shop,
            });
            const savedOrder = await this.orderRepository.save(newOrder);

            return {
                message: "Data payment saved successfully",
                status: 200,
                data: savedOrder, 
            };
        } catch (error) {
            return {
                message: error.message,
                status: 400,
                data: null,
            };
        }
    }
}
