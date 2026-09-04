import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class RequestNewVisitDto {
  @IsUUID('4')
  reclamoId!: string;

  @IsString()
  @MaxLength(2000)
  motivo!: string;

  @IsOptional()
  @IsDateString()
  programadaEn?: string;

  @IsUUID('4')
  actorId!: string;
}
