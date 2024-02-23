import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
import { LogoutDto } from './dto/logout.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokensDto } from './dto/refreshToken.dto';
import { log } from 'console';

@Injectable()
export class AuthService {
  

  private async generateAccessToken(user: User): Promise<string> {
    const payload = { 
      id: user.id,
      name: user.username,
      role: user.role,      
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('EXP_IN_ACCESS_TOKEN'),
    });
    return accessToken;
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = { 
      id: user.id,
      name: user.username,
      role: user.role,      
    };
    const refreshToken= await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('EXP_IN_REFRESH_TOKEN'),
    });
    return refreshToken;
  }

  constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
 
  async login(loginUserDto: loginUserDto): Promise<any> {
    const {email, password} = loginUserDto;
    const user = await this.UserRepository.findOne({where: {email:email}})
    console.log( user);
    
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.UNAUTHORIZED);
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        throw new HttpException({ message: 'Invalid credentials', status: HttpStatus.UNAUTHORIZED }, HttpStatus.UNAUTHORIZED);
      }
    const refreshToken = await this.generateRefreshToken(user);
    user.refreshToken = refreshToken; 
    await this.UserRepository.save(user);
  
    const accessToken = await this.generateAccessToken(user); 
    return { accessToken, refreshToken };
  }
  

  async logout(logoutDto: LogoutDto): Promise<{massage:string}> {
    const { refreshToken } = logoutDto;
    const user = await this.UserRepository.findOne({ where: { refreshToken } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.refreshToken = null;
    await this.UserRepository.save(user);
    return { massage: "logout successfully"};
  }

  
  async refreshToken(RefreshTokensDto:RefreshTokensDto): Promise<any> {
    const decodedRefreshToken: any = this.jwtService.decode(RefreshTokensDto.refreshToken);
    console.log(decodedRefreshToken);
    
    if (!decodedRefreshToken) {
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }
    const user = await this.UserRepository.findOne({
      where: { id: decodedRefreshToken.id},
    });
    if (!user) {
      throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST);
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const refreshTokenExp = decodedRefreshToken.exp;
    if (refreshTokenExp < currentTime) {
      user.refreshToken = null;
      await this.UserRepository.save(user); 
      throw new HttpException('Refresh token is expired', HttpStatus.BAD_REQUEST);
    }
    const accessToken = await this.generateAccessToken(user);
    return { accessToken};
  }
}
