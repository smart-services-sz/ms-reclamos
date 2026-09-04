import { IsString, MaxLength } from 'class-validator';

export class CitizenReopenDto {
  @IsString()
  trackingCode!: string;

  @IsString()
  contactKey!: string;

  @IsString()
  @MaxLength(2000)
  motivo!: string;
}
