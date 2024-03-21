import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/pageOption';


export class GetGroupParams extends PageOptionsDto {

    @ApiProperty({
        description: 'Keyword to search by product name.',
        example: 'iPhone 13'
    })
    @IsString()
    status_group?: string = '';
    @ApiProperty({
        description: 'Shipping code to search by.',
        example: '#75711'
    })
    @IsString()
    shipping_code?: string = '';

}