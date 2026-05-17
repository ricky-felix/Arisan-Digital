import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  /**
   * Phone number of the contact. Either `phone` or `contact_id` must be supplied.
   * UNIQUE(owner_id, phone) is enforced at the DB level — the service upserts on
   * that constraint so duplicate calls are idempotent.
   */
  @ValidateIf((o: CreateContactDto) => !o.contact_id)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone?: string;

  /**
   * UUID of the platform user this contact maps to.
   * Can be auto-resolved from `phone` in the service layer if the phone matches
   * an existing user row. Either `phone` or `contact_id` must be supplied.
   */
  @ValidateIf((o: CreateContactDto) => !o.phone)
  @IsUUID('4')
  contact_id?: string;
}
