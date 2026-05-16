import { IsString, IsNumber, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  group_id: string;

  @IsNumber()
  @Min(1000)
  amount: number;

  @IsString()
  period: string;
}
