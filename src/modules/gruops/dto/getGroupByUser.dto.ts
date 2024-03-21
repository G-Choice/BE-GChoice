import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/pageOption';
export class GetGroupByUserParams extends PageOptionsDto {

    @ApiProperty({
        description: 'ID of the receiving station to fetch related groups.',
        example: 1 
    })
    @IsNumber()
    receiving_station_id: number;
}
