import { IsIn, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import type { NotificationType } from '../../common/types/schema.types';

const NOTIFICATION_TYPES: NotificationType[] = [
  'payment_due',
  'payment_confirmed',
  'payment_rejected',
  'giliran_announced',
  'member_joined',
  'round_completed',
  'bill_created',
  'bill_settled',
  'bill_reminder',
  'settlement_confirmed',
  'settlement_rejected',
];

export class CreateNotificationDto {
  @IsUUID()
  user_id: string;

  @IsIn(NOTIFICATION_TYPES)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
