import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class TouchContactDto {
  /**
   * Phone number to identify the contact to touch.
   * Exactly one of `phone` or `contact_id` must be provided.
   */
  @ValidateIf((o: TouchContactDto) => !o.contact_id)
  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;

  /**
   * Platform user UUID to identify the contact to touch.
   * Exactly one of `phone` or `contact_id` must be provided.
   */
  @ValidateIf((o: TouchContactDto) => !o.phone)
  @IsUUID('4')
  @IsOptional()
  contact_id?: string;
}
