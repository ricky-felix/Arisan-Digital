import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class GiliranAssignment {
  @IsUUID()
  user_id: string;

  @IsInt()
  @Min(1)
  giliran_order: number;
}

export class AssignGiliranDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GiliranAssignment)
  assignments: GiliranAssignment[];
}
