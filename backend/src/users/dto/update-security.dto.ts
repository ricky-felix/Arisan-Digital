import { IsBoolean } from 'class-validator';

export class UpdateSecurityDto {
  @IsBoolean()
  app_lock_enabled: boolean;
}
