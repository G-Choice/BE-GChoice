import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class addProductDto{

    @ApiProperty({
        description: "Product's name",
        example: 'product_name',
    })
    @IsNotEmpty()
    product_name: string;

    @ApiProperty({
        description: "Product's image",
        example: 'image',
    })
  
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
    
}