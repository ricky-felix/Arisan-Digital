import { IsString, IsNumber, IsDateString, Min, MinLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsNumber()
  @Min(2)
  member_count: number;

  @IsNumber()
  @Min(1000)
  contribution_amount: number;

  @IsDateString()
  start_date: string;
}
