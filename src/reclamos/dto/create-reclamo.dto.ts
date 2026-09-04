import {
  IsArray,
  IsEmail,
  IsIn,
  IsLatitude,
  IsLongitude,
  Matches,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MensajeHistorialDto } from './mensaje-historial.dto';

export type ClaimCategoria =
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

export type ClaimPrioridad = 'alta' | 'media' | 'baja';

export type ClaimCanal =
  | 'whatsapp'
  | 'web'
  | 'email'
  | 'instagram'
  | 'facebook'
  | 'manual'
  | 'other';

export class CreateReclamoDto {
  /** ID de correlación end-to-end (UUID v4 generado por el gateway) */
  @IsUUID('4', { message: 'correlationId debe ser un UUID v4 valido' })
  correlationId!: string;

  /** Identificador único del contacto: <canal>:<tipo>:<valor> */
  @IsString()
  @IsNotEmpty({ message: 'contactKey no debe estar vacio' })
  contactKey!: string;

  /** Canal de origen del reclamo */
  @IsIn(
    ['whatsapp', 'web', 'email', 'instagram', 'facebook', 'manual', 'other'],
    {
      message: 'canal no valido',
    },
  )
  canal!: ClaimCanal;

  /** Correo electrónico del usuario (opcional) */
  @IsOptional()
  @IsEmail({}, { message: 'correo debe tener formato valido' })
  correo?: string;

  /** DNI del usuario (opcional) */
  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'dni no puede superar 10 caracteres' })
  dni?: string;

  /** Descripción del problema reportado */
  @IsString()
  @IsNotEmpty({ message: 'problema no debe estar vacio' })
  @MaxLength(1000, { message: 'problema no puede superar 1000 caracteres' })
  problema!: string;

  /** Dirección normalizada por Google Geocoding */
  @IsString()
  @IsNotEmpty({ message: 'direccion no debe estar vacia' })
  @MaxLength(500, { message: 'direccion no puede superar 500 caracteres' })
  direccion!: string;

  /** Latitud geográfica */
  @IsLatitude({ message: 'lat debe ser una latitud valida' })
  lat!: number;

  /** Longitud geográfica */
  @IsLongitude({ message: 'lng debe ser una longitud valida' })
  lng!: number;

  /** Categoría del reclamo asignada por IA */
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
  categoria!: ClaimCategoria;

  /** Prioridad del reclamo asignada por IA */
  @IsIn(['alta', 'media', 'baja'], {
    message: 'prioridad debe ser alta, media o baja',
  })
  prioridad!: ClaimPrioridad;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)
  municipalityId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)
  areaId?: string;

  /** Observaciones adicionales opcionales */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  /** Metadata técnica (geocode status, provider, etc.) */
  @IsOptional()
  @IsObject({ message: 'metadata debe ser un objeto' })
  metadata?: Record<string, unknown>;

  /** Historial de mensajes del intercambio con el usuario */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MensajeHistorialDto)
  mensajes?: MensajeHistorialDto[];
}
