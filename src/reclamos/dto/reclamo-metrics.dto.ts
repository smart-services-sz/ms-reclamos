import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TerritorialScopeDto } from '../../common/dto/territorial-scope.dto';

export class ReclamoMetricsDto extends TerritorialScopeDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(['pendiente', 'en_proceso', 'resuelto', 'rechazado', 'cerrado'])
  estado?: 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado' | 'cerrado';

  @IsOptional()
  @IsIn(['agua_y_cloacas', 'alumbrado', 'baches_y_pavimento', 'arbolado', 'residuos', 'electricidad', 'gas', 'transporte', 'infraestructura', 'otros'])
  categoria?: string;

  @IsOptional()
  @IsIn(['alta', 'media', 'baja'])
  prioridad?: 'alta' | 'media' | 'baja';

  @IsOptional()
  @IsIn(['whatsapp', 'web', 'email', 'instagram', 'facebook', 'manual', 'other'])
  canal?: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 7, 30])
  bucketDays: 1 | 7 | 30 = 1;
}