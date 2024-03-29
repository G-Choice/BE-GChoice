import { Body, Controller, Get, Patch, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/User.entity';
import { CurrentUser } from '../guards/user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateUserDTO } from './dto/update_user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // @Get()
    // @UseGuards(AuthGuard('jwt'))
    // async getAllUsers(): Promise<User[]> {
    //     const users = await this.userService.getAllUsers();
    //     return users;
    // }

    @Get('currentUser')
    @UseGuards(AuthGuard)
    async getCurrentUser(@CurrentUser() currentUser: User): Promise<{ data: User | null, message: string, statusCode: number }> {
      const result = await this.userService.getCurrentUser(currentUser);
      return result;
    }

    @Patch()
    // @UseInterceptors(FilesInterceptor('files', 5))
    @UseInterceptors(FileInterceptor('file', { limits: { fieldSize: 20000 * 1024 * 1024 }}))
    @UseGuards(AuthGuard)
    async updateUser(  @UploadedFile() file: Express.Multer.File,@CurrentUser() user: User, @Body()updateUserDTO :UpdateUserDTO ): Promise<{ message: string, data?: User }> {
      const result = await this.userService.updateUser(file, user,updateUserDTO);
      return result;
    }
}
