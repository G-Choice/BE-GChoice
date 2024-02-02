import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Order } from '../enum/enums';

export class PageOptionsDto {

  // @IsString()
  // searchByName?: string = '';
  // @IsString()
  // searchByPrice?: string = '';
  // @IsString()
  // searchByCategory?: string = '';

  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  @IsString()
  @IsOptional()
  orderBy?: string = ''; 
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  take?: number = 6;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
