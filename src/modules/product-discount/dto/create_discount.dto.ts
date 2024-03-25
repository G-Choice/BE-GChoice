import { IsInt, Min, IsDecimal, IsEnum, IsNumber } from 'class-validator';
import { StatusEnum } from 'src/common/enum/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDiscountDto {
  @ApiProperty({
    description: 'Minimum quantity required for the discount to apply.',
    example: 10
  })
  @IsInt()
  @Min(1)
  minQuantity: number;

  @ApiProperty({
    description: 'Discount percentage to be applied.',
    example: 10.5
  })
  @IsDecimal({ decimal_digits: '2' })
  discountPercentage: number;


  @ApiProperty({
    description: 'product id.',
    example: 10
  })
  @IsNumber()
  product_id: number;

}
