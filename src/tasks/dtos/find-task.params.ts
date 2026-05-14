import { IsEnum, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '../task.model';
import { Transform } from 'class-transformer';

export class FindTaskParamsDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  @MinLength(3)
  search?: string;

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }: { value?: string }) => {
    if (!value) return undefined;

    return value
      .split(',')
      .map((label: string) => label.trim())
      .filter((label: string) => label.length > 0);
  })
  labels?: string[];

  @IsOptional()
  @IsIn(['createdAt', 'title', 'status'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
