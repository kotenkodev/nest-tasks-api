import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '../task.model';

export class FindTaskParamsDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  @MinLength(3)
  search?: string;
}
