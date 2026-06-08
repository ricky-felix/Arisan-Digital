import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
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

  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: string;

  // DEPRECATED: payment_methods string[] (v0 format) is no longer accepted
  // via the general profile update endpoint. Use POST/PUT /users/me/payment-methods
  // to manage payment methods. This field is intentionally removed from UpdateUserDto
  // to prevent direct JSONB overwrites that would bypass v1 validation and id generation.
}
