import { Body, Controller, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createuser.dto';
import { VerifyOtpDto} from './dto/verifyOTP.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto){
        return this.authService.register(createUserDto);
    }

    @Post('verifyOtp')
    async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
     
      return  await this.authService.verifyOTP(verifyOtpDto);
       
    }
  
}
