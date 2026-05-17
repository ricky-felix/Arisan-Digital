import { IsString, MinLength } from 'class-validator';

export class RejectSettlementDto {
  @IsString()
  @MinLength(1)
  reason: string;
}
