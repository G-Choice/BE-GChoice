import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class SaveDataDto {
    @ApiProperty({
        description: 'Delivery address.',
        example: '123 Street, City, Country'
    })
    @IsString()
    deliveryAddress: string;

    @ApiProperty({
        description: 'Phone number.',
        example: '123456789'
    })
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        description: 'product_id.',
        example: 123
    })
    @IsNumber()
    product_id: number;

    @ApiProperty({
        description: ' total_price.',
        example: 123
    })
    @IsNumber()
    total_price: number;
}
