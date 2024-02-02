import { IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/pageOption';
import { StatusEnum } from 'src/common/enum/enums';


export class GetProductParams extends PageOptionsDto {
    @IsString()
    searchByName?: string = '';
    @IsString()
    sortByPrice?: string = '';
    @IsString()
    searchByCategory?: number;

}
