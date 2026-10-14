import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TerritorialScopeDto } from '../../common/dto/territorial-scope.dto';

export class ReviewResolutionDto extends TerritorialScopeDto {
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
