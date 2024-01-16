import { IsEmail, IsNotEmpty, IsNumber, IsPhoneNumber, Length, NotContains } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @NotContains(' ', { message: "user name shouldn't countain white spaces" })
  username: string;

  @IsEmail()
  email: string;
  
  number_phone: string;
  
  @Length(6, 20)
  password: string;

  
}