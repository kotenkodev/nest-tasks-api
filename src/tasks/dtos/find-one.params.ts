import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FindOneParamsDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}
