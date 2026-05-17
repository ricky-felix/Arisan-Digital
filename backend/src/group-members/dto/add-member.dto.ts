import { IsIn, IsOptional, IsUUID } from 'class-validator';
import type { GroupRole } from '../../common/types/schema.types';

export class AddMemberDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsIn(['member', 'admin'])
  group_role?: GroupRole;
}
