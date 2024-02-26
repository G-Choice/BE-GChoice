import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class createGroupDto {

    @ApiProperty({
        description: 'Name of the group.',
        example: 'My Group'
    })
    @IsNotEmpty()
    @IsString()
    group_name: string;


    @ApiProperty({
        description: 'Description of the group.',
        example: 'A brief description of the group.'
    })
    @IsNotEmpty()
    @IsString()
    description: string;
    

    @ApiProperty({
        description: 'Size of the group.',
        example: '10'
    })
    @IsNotEmpty()
    @IsString()
    groupSize: number;
    
    @ApiProperty({
        description: 'Duration of the group in hours.',
        example: 8
    })
    @IsNotEmpty()
    @IsNumber()
    hours: number;
    
}
