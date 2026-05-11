import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReclamoDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'problema no puede superar 1000 caracteres' })
  problema?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'direccion no puede superar 500 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsLatitude({ message: 'lat debe ser una latitud valida' })
  lat?: number;

  @IsOptional()
  @IsLongitude({ message: 'lng debe ser una longitud valida' })
  lng?: number;

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
    message: 'prioridad debe ser alta, media o baja',
  })
  prioridad?: 'alta' | 'media' | 'baja';

  @IsOptional()
  @IsIn(['pendiente', 'en_proceso', 'resuelto', 'rechazado', 'cerrado'], {
    message: 'estado no valido',
  })
  estado?: 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado' | 'cerrado';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  @IsOptional()
  @IsObject({ message: 'metadata debe ser un objeto' })
  metadata?: Record<string, unknown>;
}

export class UpdateReclamoCommandDto {
  @IsString()
  @IsUUID('4', { message: 'id debe ser un UUID v4 valido' })
  id!: string;

  @IsObject({ message: 'data debe ser un objeto' })
  @ValidateNested()
  @Type(() => UpdateReclamoDto)
  data!: UpdateReclamoDto;
}
