import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ReclamoResponseDto } from './dto/reclamo-response.dto';

@Injectable()
export class ReclamosService {
  private readonly logger = new Logger(ReclamosService.name);
  private readonly trackingCodePrefix = 'REC';

  constructor(private readonly prisma: PrismaService) {}

  // Persiste el reclamo y su historial de mensajes en PostgreSQL dentro de una
  // única transacción atómica. Si falla cualquier INSERT, Prisma hace rollback automático.
  async create(payload: CreateReclamoDto): Promise<ReclamoResponseDto & { message: string; reclamoId: string; trackingCode: string; status: string; createdAt: string; data: object }> {
    this.logger.log(
      `[${payload.correlationId}] Persistiendo reclamo | contactKey=${payload.contactKey} | categoria=${payload.categoria} | prioridad=${payload.prioridad}`,
    );

    // Convierte el array de mensajes del DTO al formato de Prisma nested create.
    // `creadoEn` se parsea a Date; si no viene, usa el momento actual.
    const mensajesCreate: Prisma.MensajeHistorialCreateWithoutReclamoInput[] =
      (payload.mensajes || []).map((m) => ({
        origen: m.origen,
        texto: m.texto,
        creadoEn: m.creadoEn ? new Date(m.creadoEn) : new Date(),
        metadata: (m.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      }));

    const reclamo = await this.createWithTrackingCode(payload, mensajesCreate);

    const mensajesCount = mensajesCreate.length;

    this.logger.log(
      `[${payload.correlationId}] Reclamo persistido | id=${reclamo.id} | mensajes=${mensajesCount}`,
    );

    return {
      id: reclamo.id,
      codigoSeguimiento: reclamo.codigoSeguimiento,
      correlationId: reclamo.correlationId,
      contactKey: reclamo.contactKey,
      canal: reclamo.canal as any,
      correo: reclamo.correo,
      dni: reclamo.dni,
      problema: reclamo.problema,
      direccion: reclamo.direccion,
      lat: reclamo.lat,
      lng: reclamo.lng,
      categoria: reclamo.categoria as any,
      prioridad: reclamo.prioridad as any,
      estado: reclamo.estado as any,
      observaciones: reclamo.observaciones,
      creadoEn: reclamo.creadoEn,
      actualizadoEn: reclamo.actualizadoEn,
      resolvedAt: reclamo.resolvedAt,
      message: `Tu reclamo fue creado correctamente. Codigo de seguimiento: ${reclamo.codigoSeguimiento}`,
      reclamoId: reclamo.id,
      trackingCode: reclamo.codigoSeguimiento,
      status: 'created',
      createdAt: reclamo.creadoEn.toISOString(),
      data: {
        problema: reclamo.problema,
        direccion: reclamo.direccion,
        lat: reclamo.lat,
        lng: reclamo.lng,
        categoria: reclamo.categoria,
        prioridad: reclamo.prioridad,
      },
    };
  }

  private async createWithTrackingCode(
    payload: CreateReclamoDto,
    mensajesCreate: Prisma.MensajeHistorialCreateWithoutReclamoInput[],
  ) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      const trackingCode = this.generateTrackingCode();

      try {
        const reclamo = await this.prisma.$transaction(async (tx) => {
          const created = await tx.reclamo.create({
            data: {
              codigoSeguimiento: trackingCode,
              correlationId: payload.correlationId,
              contactKey: payload.contactKey,
              canal: payload.canal,
              correo: payload.correo ?? null,
              dni: payload.dni ?? null,
              problema: payload.problema,
              direccion: payload.direccion,
              lat: payload.lat,
              lng: payload.lng,
              categoria: payload.categoria,
              prioridad: payload.prioridad,
              observaciones: payload.observaciones ?? null,
              metadata: (payload.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
              mensajes: mensajesCreate.length ? { create: mensajesCreate } : undefined,
            },
          });

          return created;
        });

        return reclamo;
      } catch (error: unknown) {
        if (this.isTrackingCodeUniqueViolation(error)) {
          this.logger.warn(
            `[${payload.correlationId}] Colision de codigo de seguimiento (${trackingCode}) en intento ${attempt}; reintentando`,
          );
          continue;
        }

        throw error;
      }
    }

    throw new Error('No se pudo generar un codigo de seguimiento unico');
  }

  private generateTrackingCode(): string {
    const nowPart = Date.now().toString(36).toUpperCase().slice(-6);
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${this.trackingCodePrefix}-${nowPart}${randomPart}`;
  }

  private isTrackingCodeUniqueViolation(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return false;
    }

    if (error.code !== 'P2002') {
      return false;
    }

    const target = error.meta?.target;
    if (Array.isArray(target)) {
      return target.includes('codigo_seguimiento') || target.includes('codigoSeguimiento');
    }

    return typeof target === 'string' && target.includes('codigo');
  }
}
