import { IsArray } from 'class-validator';
import { PageMetaDto } from './pageMeta';

export class ResponsePaginate<T> {
  @IsArray()
  readonly data: T[];

  readonly meta: PageMetaDto;

  readonly message: string;

  constructor(data: T[], meta: PageMetaDto, message: string) {
    this.data = data;
    this.meta = meta;
    this.message = message;
  }
}
