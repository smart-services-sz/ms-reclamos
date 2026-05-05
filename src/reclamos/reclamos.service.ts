import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ReclamoResponseDto } from './dto/reclamo-response.dto';

@Injectable()
export class ReclamosService {
  private readonly logger = new Logger(ReclamosService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Persiste el reclamo y su historial de mensajes en PostgreSQL dentro de una
  // única transacción atómica. Si falla cualquier INSERT, Prisma hace rollback automático.
  async create(payload: CreateReclamoDto): Promise<ReclamoResponseDto & { message: string; reclamoId: string; status: string; createdAt: string; data: object }> {
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

    const reclamo = await this.prisma.$transaction(async (tx) => {
      const created = await tx.reclamo.create({
        data: {
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
          // Nested create: inserta los mensajes en la misma transacción.
          mensajes: mensajesCreate.length
            ? { create: mensajesCreate }
            : undefined,
        },
      });

      return created;
    });

    const mensajesCount = mensajesCreate.length;

    this.logger.log(
      `[${payload.correlationId}] Reclamo persistido | id=${reclamo.id} | mensajes=${mensajesCount}`,
    );

    return {
      id: reclamo.id,
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
      message: `Tu reclamo fue creado correctamente. ID: ${reclamo.id}`,
      reclamoId: reclamo.id,
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
}
