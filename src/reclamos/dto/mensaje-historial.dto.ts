import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

// DTO de un mensaje individual del historial de conversación.
// Se persiste en la tabla mensajes_historial con clave foránea al reclamo (cascade delete).
export class MensajeHistorialDto {
  @IsIn(['usuario', 'asistente'], { message: 'origen debe ser usuario o asistente' })
  origen!: 'usuario' | 'asistente'; // Quién envió el mensaje.

  @IsString()
  @IsNotEmpty()
  texto!: string;

  @IsOptional()
  @IsString()
  creadoEn?: string; // ISO 8601; si no viene se usa new Date() al persistir.

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>; // Datos extra del mensaje (si aplica).
}
