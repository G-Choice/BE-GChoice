import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdateProductDto{

    @ApiProperty({
        description: "Product's name",
        example: 'product_name',
    })
    @IsNotEmpty()
    product_name: string;

   
    @ApiProperty({
        description: "Product's price",
        example: 'price',
    })
    @IsNotEmpty()
    price: number;
    
    @ApiProperty({
        description: "Product's description",
        example: 'description',
    })
    @IsNotEmpty()
    description: string;
    
    @ApiProperty({
        description: "Product's brand",
        example: 'brand',
    })
    @IsNotEmpty()
    brand: string;

    @ApiProperty({
        description: "Product status",
        example: 'active , inactive , maintaining',
    })
    @IsNotEmpty()
    status: string;
    

    @ApiProperty({
        description: "Product availability",
    })
    @IsNotEmpty({ message: 'Product availability must not be empty' })
    @IsNumber({}, { message: 'Product availability must be a number' })
    product_availability: number;


        @ApiProperty({
        description: "Category ID",
    })
    @IsNotEmpty({ message: 'Category ID must not be empty' })
    @IsNumber({}, { message: 'Category ID must be a number' })
    category_id: number;

    @ApiProperty({
        description: "Product ID.",
    })
    @IsNumber()
    product_id: number;

    
        
}