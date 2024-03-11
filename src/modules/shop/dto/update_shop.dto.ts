import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateShopDTO {

    @ApiProperty({
        description: "Shop's name",
        example: 'My Shop',
    })
    @IsNotEmpty()
    shop_name: string;

    @ApiProperty({
        description: "Shop's phone number",
        example: '1234567890',
    })
    @IsNotEmpty()
    shop_phone: string; 

    @ApiProperty({
        description: "Shop's email",
        example: 'shop@example.com',
    })
    @IsNotEmpty()
    shop_email: string;

    @ApiProperty({
        description: "Shop's address",
        example: '123 Main Street',
    })
    @IsNotEmpty()
    shop_address: string;

    @ApiProperty({
        description: "Shop's description",
        example: 'We sell various products.',
    })
    @IsNotEmpty()
    shop_description: string;
}
