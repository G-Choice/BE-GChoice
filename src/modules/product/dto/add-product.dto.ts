import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class addProductDto {
    @ApiProperty({
        description: "Product's name",
        example: 'product_name',
    })
    @IsNotEmpty({ message: 'Product name must not be empty' })
    @IsString({ message: 'Product name must be a string' })
    product_name: string;

    @ApiProperty({
        description: "Product's price",
        example: 123.45,
    })
    @IsNotEmpty({ message: 'Price must not be empty' })
    @IsNumber({}, { message: 'Price must be a number' })
    price: number;

    @ApiProperty({
        description: "Product's description",
        example: 'description',
    })
    @IsNotEmpty({ message: 'Description must not be empty' })
    @IsString({ message: 'Description must be a string' })
    description: string;

    @ApiProperty({
        description: "Product's brand",
        example: 'brand',
    })
    @IsNotEmpty({ message: 'Brand must not be empty' })
    @IsString({ message: 'Brand must be a string' })
    brand: string;

    @ApiProperty({
        description: "Product availability",
        example: 10,
    })
    @IsNotEmpty({ message: 'Product availability must not be empty' })
    @IsNumber({}, { message: 'Product availability must be a number' })
    product_availability: number;

    @ApiProperty({
        description: "Category ID",
        example: 13,
    })
    @IsNotEmpty({ message: 'Category ID must not be empty' })
    @IsNumber({}, { message: 'Category ID must be a number' })
    category_id: number;
}
