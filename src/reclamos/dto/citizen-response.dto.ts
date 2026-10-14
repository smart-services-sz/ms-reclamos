import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CitizenResponseDto {
  @IsOptional()
  @IsUUID('4')
  reclamoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  trackingCode?: string;

  @IsIn(['confirmada', 'disconforme'])
  tipo!: 'confirmada' | 'disconforme';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comentario?: string;

  @IsString()
  contactKey!: string;
}
