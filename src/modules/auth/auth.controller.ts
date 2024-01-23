import { Body, Controller, HttpException, HttpStatus, Param, Post, ValidationPipe,UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createuser.dto';
import { VerifyOtpDto} from './dto/verifyOTP.dto';
import { loginUserDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokensDto } from './dto/refreshToken.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/register')
    async register(@Body() createUserDto: CreateUserDto){
        return this.authService.register(createUserDto);
    }

    @Post('/verifyOtp')
    async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
     
      return  await this.authService.verifyOTP(verifyOtpDto);
       
    }
    @Post('/login')
    @UsePipes(ValidationPipe)
    login(@Body() loginUserDto:loginUserDto ):Promise<any> {
        return this.authService.login(loginUserDto);
    }
  
    
    @Post('/logout')
    async logout(@Body() logoutDto: LogoutDto) {
      return this.authService.logout(logoutDto);
    }
  
    
    @Post('/refresh')
      refreshToken(@Body() refreshTokensDto:RefreshTokensDto):Promise<any>{
          return this.authService.refreshToken(refreshTokensDto);
      }
  
}
