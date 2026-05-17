import { IsUUID } from 'class-validator';

export class SetRecipientDto {
  @IsUUID()
  recipient_id: string;
}
