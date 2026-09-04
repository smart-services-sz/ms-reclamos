import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ReviewResolutionDto {
  @IsUUID('4')
  reclamoId!: string;

  @IsIn(['aprobada', 'rechazada'])
  resultado!: 'aprobada' | 'rechazada';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comentario?: string;

  @IsUUID('4')
  actorId!: string;
}
