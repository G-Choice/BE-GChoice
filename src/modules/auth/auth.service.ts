import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/entities/User.entity';
import { CreateUserDto } from './dto/createuser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PositionEnum, StatusEnum } from 'src/common/enum/enums';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly UserRepository: Repository<User>,
    ) { }

    async register(createUserDto: CreateUserDto): Promise<{ message: string, status: number, data?: User }> {
        try {
            const existingUserByUsername = await this.UserRepository.findOne({ where: { username: createUserDto.username } });
            const existingUserByEmail = await this.UserRepository.findOne({ where: { email: createUserDto.email } });

            if (existingUserByUsername || existingUserByEmail) {
                return { message: 'Username or email already exists', status: HttpStatus.BAD_REQUEST };
            }

            const salt = await bcrypt.genSalt();
            const password = createUserDto.password;
            const hashedPassword = await bcrypt.hash(password, salt);

            const createdUser = this.UserRepository.create({
                username: createUserDto.username,
                email: createUserDto.email,
                number_phone: createUserDto.number_phone,
                password: hashedPassword,
                role: PositionEnum.USER,
                status: StatusEnum.ACTIVE,
            });

            await this.UserRepository.save(createdUser);

            return { message: 'User registered successfully', status: HttpStatus.CREATED, data: createdUser };
        } catch (error) {
            throw new HttpException({ message: 'Registration failed', status: HttpStatus.INTERNAL_SERVER_ERROR }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
