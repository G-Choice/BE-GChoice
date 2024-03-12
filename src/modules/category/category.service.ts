import { Body, HttpStatus, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { CurrentUser } from '../guards/user.decorator';
import { User } from 'src/entities/User.entity';
import { Shop } from 'src/entities/shop.entity';
import { CreateCategoryDto } from './dto/create_category.dto';
import { Product } from 'src/entities/product.entity';
import { UpdateCategoryDTO } from './dto/update_category.dto';
@Injectable()
export class CategoryService {

    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

    ) { }

    async getAllCategory(@CurrentUser() user: User): Promise<{ data: Category[], message: string, statusCode: number }> {
        const Shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
        const categories = await this.categoryRepository.find({ where: { shop: { id: Shop.id } } });
        return {
            data: categories,
            message: 'Get all categories successfully',
            statusCode: HttpStatus.OK,
        };
    }

    async createCategory(@Body() createCategoryDto: CreateCategoryDto, @CurrentUser() user: User,): Promise<{ message: string, data: Category, statusCode: number }> {
        const Shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
        const newCategory = new Category();
        newCategory.category_name = createCategoryDto.category_name;
        newCategory.shop = Shop;
        const savedCategory = await this.categoryRepository.save(newCategory);
        return {
            message: 'Category created successfully!',
            data: savedCategory,
            statusCode: HttpStatus.OK,
        };
    }

    async deleteCategory(@Param() id: number, @CurrentUser() user: User): Promise<{ message: string, data: Category | null, statusCode: number }> {
        try {
            const Shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
            const activeProductsCount = await this.productRepository.count({
                where: { category: { id: id }, status: 'active' }
            });

            if (activeProductsCount > 0) {
                throw new Error('Cannot delete category: Active products still exist');
            }

            const category = await this.categoryRepository.findOne({ where: { id: id, shop: { id: Shop.id } } });
            if (!category) {
                throw new Error('Category not found');
            }

            await this.categoryRepository.remove(category);

            return { message: 'Delete category successfully!', data: null, statusCode: HttpStatus.OK };
        } catch (error) {
            console.error('Error deleting category:', error.message);
            return { message: error.message, data: null, statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
        }
    }


    async updateCategory(
        @Param('id')id: number,
        @CurrentUser() user: User,
        @Body() updateCategoryDTO: UpdateCategoryDTO
    ): Promise<{ message: string, data: Category, statusCode: number }> {
        try {         
            const shop = await this.shopRepository.findOne({ where: { user: { id: user.id } } });
            if (!shop) {
                return {
                    message: "Shop not found",
                    data: null,
                    statusCode: HttpStatus.NOT_FOUND,
                }   
            }
            const category = await this.categoryRepository.findOne({ where: { id: id, shop: { id: shop.id } } });

            category.category_name = updateCategoryDTO.category_name;
            const updatedCategory = await this.categoryRepository.save(category);
            return {
                message: "Category updated successfully",
                data: updatedCategory,
                statusCode: 200
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to update user' + error.message,
                data: null,
            };
        }
    }
}

