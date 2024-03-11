import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateCategoryDTO{

    @ApiProperty({
        description: " category name",
        example: 'giày',
    })
    @IsNotEmpty()
    category_name: string;

  
}