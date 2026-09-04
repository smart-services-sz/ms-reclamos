import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CloseReclamoDto {
  @IsUUID('4')
  reclamoId!: string;

  @IsString()
  @MaxLength(2000)
  motivo!: string;

  @IsUUID('4')
  actorId!: string;
}
