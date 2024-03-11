import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateUserDTO{

    @ApiProperty({
        description: "User's username",
        example: 'username',
    })
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: "User's phone number",
        example: '1234567890',
    })
    @IsNotEmpty()
    number_phone: string;
}
