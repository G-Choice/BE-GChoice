import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class SaveDataPayemntDto {
    @ApiProperty({
        description: 'Delivery address.',
        example: '123 Street, City, Country'
    })
    @Optional()
    @IsString()
    deliveryAddress: string;

    @ApiProperty({
        description: 'Phone number.',
        example: '123456789'
    })
    @Optional()
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        description: 'Group ID.',
        example: 123
    })
    @IsNumber()
    group_id: number;
}
