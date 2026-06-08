import { IsUUID } from 'class-validator';

export class SyncPhoneDto {
  @IsUUID()
  userId: string;
}
