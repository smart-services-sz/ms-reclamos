import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ReopenReclamoDto {
  @IsUUID('4')
  reclamoId!: string;

  @IsString()
  @MaxLength(2000)
  motivo!: string;

  @IsOptional()
  @IsUUID('4')
  actorId?: string;
}
