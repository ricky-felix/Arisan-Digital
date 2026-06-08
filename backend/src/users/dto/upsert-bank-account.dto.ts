import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpsertBankAccountDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  bank: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  account_number: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  holder_name: string;
}
