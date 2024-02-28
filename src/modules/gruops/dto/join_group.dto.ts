import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
export class JoinGroupDto {
    @ApiProperty({
        description: 'Quantity of products.',
        example: 123
    })
    @IsNotEmpty()
    @IsNumber()
    quantity_product: number;

    @ApiProperty({
        description: 'group_id',
        example: 123
    })
    @IsNumber()
    group_id: number;
}
