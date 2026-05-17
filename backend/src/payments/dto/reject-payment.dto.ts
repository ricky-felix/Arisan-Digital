import { IsString, MinLength } from 'class-validator';

export class RejectPaymentDto {
  @IsString()
  @MinLength(5)
  rejection_reason: string;
}
