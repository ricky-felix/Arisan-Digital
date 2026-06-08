import { IsString, Matches } from 'class-validator';

export class VerifyPinDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'pin must be exactly 6 digits' })
  pin: string;
}
