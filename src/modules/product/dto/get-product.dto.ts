import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/pageOption';


export class GetProductParams extends PageOptionsDto {
    
    @ApiProperty({
        description: 'Keyword to search by product name.',
        example: 'iPhone 13'
    })
    @IsString()
    searchByName?: string = '';
    
    @ApiProperty({
        description: 'Sort products by price.',
        example: 'asc or desc' // or 'desc'
    })
    @IsString()
    sortByPrice?: string = '';
    
    @ApiProperty({
        description: 'ID of the category to search products by.',
        example: 1 // ID of the category
    })
    @IsNumber()
    searchByCategory?: number;
}