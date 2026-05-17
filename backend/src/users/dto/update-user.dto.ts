import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { Language } from '../../common/types/schema.types';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsIn(['id', 'en'])
  language?: Language;
}
