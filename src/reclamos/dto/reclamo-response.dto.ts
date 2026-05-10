import { ClaimCanal, ClaimCategoria, ClaimPrioridad } from './create-reclamo.dto';

export type ReclamoEstado = 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado' | 'cerrado';

export class ReclamoResponseDto {
  /** ID único del reclamo en la base de datos (UUID) */
  id!: string;

  /** Codigo alfanumerico unico para seguimiento por parte del usuario */
  codigoSeguimiento!: string;

  /** ID de correlación end-to-end */
  correlationId!: string;

  /** Identificador del contacto */
  contactKey!: string;

  /** Canal de origen */
  canal!: ClaimCanal;

  /** Correo del usuario si fue provisto */
  correo?: string | null;

  /** DNI del usuario si fue provisto */
  dni?: string | null;

  /** Descripción del problema */
  problema!: string;

  /** Dirección normalizada */
  direccion!: string;

  /** Latitud */
  lat!: number;

  /** Longitud */
  lng!: number;

  /** Categoría asignada por IA */
  categoria!: ClaimCategoria;

  /** Prioridad asignada por IA */
  prioridad!: ClaimPrioridad;

  /** Estado actual del reclamo */
  estado!: ReclamoEstado;

  /** Observaciones adicionales */
  observaciones?: string | null;

  /** Fecha de creación */
  creadoEn!: Date;

  /** Fecha de última actualización */
  actualizadoEn!: Date;

  /** Fecha de resolución si fue resuelto */
  resolvedAt?: Date | null;
}
