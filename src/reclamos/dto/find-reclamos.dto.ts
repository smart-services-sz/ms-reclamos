import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FindReclamosDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'contactKey debe ser una cadena de texto' })
  contactKey?: string;

  @IsOptional()
  @IsString({ message: 'codigoSeguimiento debe ser una cadena de texto' })
  codigoSeguimiento?: string;

  @IsOptional()
  @IsIn(['pendiente', 'en_proceso', 'resuelto', 'rechazado', 'cerrado'], {
    message: 'estado no valido',
  })
  estado?: 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado' | 'cerrado';

  @IsOptional()
  @IsIn(
    [
      'agua_y_cloacas',
      'alumbrado',
      'baches_y_pavimento',
      'arbolado',
      'residuos',
      'electricidad',
      'gas',
      'transporte',
      'infraestructura',
      'otros',
    ],
    { message: 'categoria no valida' },
  )
  categoria?:
    | 'agua_y_cloacas'
    | 'alumbrado'
    | 'baches_y_pavimento'
    | 'arbolado'
    | 'residuos'
    | 'electricidad'
    | 'gas'
    | 'transporte'
    | 'infraestructura'
    | 'otros';

  @IsOptional()
  @IsIn(['alta', 'media', 'baja'], {
    message: 'prioridad no valida',
  })
  prioridad?: 'alta' | 'media' | 'baja';

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, -1], {
    message: 'sortDirection debe ser 1 (asc) o -1 (desc)',
  })
  sortDirection: 1 | -1 = -1;
}
