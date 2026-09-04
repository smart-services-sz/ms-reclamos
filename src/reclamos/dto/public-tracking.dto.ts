import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class PublicTrackingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^REC-[A-Z0-9]+$/i, { message: 'codigo de seguimiento no valido' })
  codigoSeguimiento!: string;

  @IsString()
  @IsNotEmpty()
  contactKey!: string;
}
