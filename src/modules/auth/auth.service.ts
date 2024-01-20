import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/entities/User.entity';
import { CreateUserDto } from './dto/createuser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PositionEnum, StatusEnum } from 'src/common/enum/enums';
import * as speakeasy from 'speakeasy';
import { EmailService } from '../email/email.service';
import { VerifyOtpDto } from './dto/verifyOTP.dto';
import { JwtService } from '@nestjs/jwt';
import { loginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  validateUserById(sub: any) {
      throw new Error('Method not implemented.');
  }

  private generateJWT(user: User) {
    const payload = {
      id: user.id,
      role: user.role,
    };
    return this.jwtService.sign(payload );
  }

  constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService
  ) { }

  async register(createUserDto: CreateUserDto): Promise<{ message: string, data?: User }> {
    try {
      const existingUserByUsername = await this.UserRepository.findOne({ where: { username: createUserDto.username } });
      const existingUserByEmail = await this.UserRepository.findOne({ where: { email: createUserDto.email } });

      if (existingUserByUsername || existingUserByEmail) {
        throw new HttpException({ message: 'Username or email already exists', status: HttpStatus.BAD_REQUEST }, HttpStatus.BAD_REQUEST);
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

      const otp = this.emailService.generateOTP();

      await this.emailService.sendOTPEmail(createdUser.email, otp);

      return { message: 'User registered successfully. Please check your email for OTP.', data: createdUser };
    } catch (error) {
      throw new HttpException({ message: 'Registration failed', error: error.message || 'Internal Server Error', status: HttpStatus.INTERNAL_SERVER_ERROR }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyOTP(verifyOtpDto:VerifyOtpDto): Promise<{ message: string; status: number }> {
    const user = await this.UserRepository.findOne({ where: { email: verifyOtpDto.email } });
    console.log(user);
        if (!user) {
      throw new HttpException({ message: 'User not found', status: HttpStatus.NOT_FOUND }, HttpStatus.NOT_FOUND);
    }
    const otpValidates = speakeasy.totp.verify({
      secret: "tjakdhh123",
      encoding: 'base32',
      token: verifyOtpDto.otp,
      window: 2,
    });
    if (otpValidates) {
      user.isVerified = true;
      await this.UserRepository.save(user);
      return {message:"OTP verified successfully",status:HttpStatus.OK};
    } else {
      throw new HttpException({ message: 'Invalid OTP', status: HttpStatus.BAD_REQUEST }, HttpStatus.BAD_REQUEST);
    }
  }
  async login(loginUserDto: loginUserDto):Promise<{token:string}>{
    const {email, password} = loginUserDto;
    const user = await this.UserRepository.findOne({where: {email:email}});
    if (!user) {
      throw new HttpException({ message: 'Invalid credentials', status: HttpStatus.UNAUTHORIZED }, HttpStatus.UNAUTHORIZED);
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new HttpException({ message: 'Invalid credentials', status: HttpStatus.UNAUTHORIZED }, HttpStatus.UNAUTHORIZED);
    }
    const token = this.generateJWT(user);
    return {token};
  }
 
}
