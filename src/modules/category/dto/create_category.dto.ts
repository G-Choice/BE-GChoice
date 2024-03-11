import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateCategoryDto{

    @ApiProperty({
        description: " category name",
        example: 'giày',
    })
    @IsNotEmpty()
    category_name: string;

  
}