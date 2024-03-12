import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { CreateCategoryDto } from './dto/create_category.dto';
import { Category } from 'src/entities/category.entity';
import { Query } from 'typeorm/driver/Query';
import { UpdateCategoryDTO } from './dto/update_category.dto';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    @UseGuards(AuthGuard)
    getAllCategory(@CurrentUser() user: User): Promise<any> {
        return this.categoryService.getAllCategory(user);
    }


    @Post()
    @UseGuards(AuthGuard)
    async createCategory(
        @Body() createCategoryDto: CreateCategoryDto,
        @CurrentUser() user: User
    ): Promise<{ message: string, data: Category, statusCode: number }> {
        return this.categoryService.createCategory(createCategoryDto, user);
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    async updateUser(
        @Param('id') id: number,
        @CurrentUser() user: User,
        @Body() updateCategoryDTO: UpdateCategoryDTO
    ): Promise<{ message: string, data: Category, statusCode: number }> {
        const result = await this.categoryService.updateCategory(id, user, updateCategoryDTO);
        return result;
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deteteCategory(
        @Param('id') id: number,
        @CurrentUser() user: User
    ): Promise<{ message: string, data: Category, statusCode: number }> {
        return this.categoryService.deleteCategory(id, user);
    }


}
