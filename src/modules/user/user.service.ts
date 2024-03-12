import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
import { UpdateUserDTO } from './dto/update_user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getCurrentUser(user: User): Promise<{ data: User | null, message: string, statusCode: number }> {
    const user_id  = user.id;
    const currentUser = await this.userRepository.findOne({ where:{id: user_id}});

    if (!currentUser) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        data: null,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User found',
      data: currentUser,
    };
  }


  async updateUser(file: Express.Multer.File, user: User, updateUserDTO: UpdateUserDTO): Promise<{ data: User | null, message: string, statusCode: number }> {
    try {
      
      const foundUser = await this.userRepository.findOne({ where: { id: user.id }});
      if (!foundUser) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          data: null,
        };
      }
      foundUser.username = updateUserDTO.username;
      foundUser.number_phone = updateUserDTO.number_phone;
      if (file) {
        const cloudinaryResult = await this.cloudinaryService.uploadImages([file], 'user');
        foundUser.image = cloudinaryResult.map(item => item.secure_url);
      }

      await this.userRepository.save(foundUser);
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: foundUser,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update user'+error.message,
        data: null,
      };
    }
  }
  
}