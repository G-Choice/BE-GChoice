import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createuser.dto';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto){
        return this.authService.register(createUserDto);
    }

    // @Post('login')   
    // async login(@Request() req, @Body() doc: LoginDto) {
    //     return this.authService.login(req.user._doc);
    // }
  
}
