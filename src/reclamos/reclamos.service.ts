import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma, Reclamo } from '@prisma/client';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ReclamoResponseDto } from './dto/reclamo-response.dto';
import { FindReclamosDto } from './dto/find-reclamos.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { ReviewResolutionDto } from './dto/review-resolution.dto';
import { RequestNewVisitDto } from './dto/request-new-visit.dto';
import { CloseReclamoDto } from './dto/close-reclamo.dto';
import { PublicTrackingDto } from './dto/public-tracking.dto';
import { CitizenResponseDto } from './dto/citizen-response.dto';
import { ReopenReclamoDto } from './dto/reopen-reclamo.dto';
import { CitizenReopenDto } from './dto/citizen-reopen.dto';
import { ClaimStatusChangedEvent } from './events/claim-status-changed.event';

type ReclamoCrudResponse = ReclamoResponseDto & {
  message: string;
  reclamoId: string;
  trackingCode: string;
  status: string;
  createdAt: string;
  data: object;
};

type PaginatedReclamosResponse = {
  items: ReclamoCrudResponse[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

@Injectable()
export class ReclamosService {
  private readonly logger = new Logger(ReclamosService.name);
  private readonly trackingCodePrefix = 'REC';

  constructor(
    private readonly prisma: PrismaService,
    @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
  ) {}

  // Persiste el reclamo y su historial de mensajes en PostgreSQL dentro de una
  // única transacción atómica. Si falla cualquier INSERT, Prisma hace rollback automático.
  async create(payload: CreateReclamoDto): Promise<ReclamoCrudResponse> {
    this.logger.log(
      `[${payload.correlationId}] Persistiendo reclamo | contactKey=${payload.contactKey} | categoria=${payload.categoria} | prioridad=${payload.prioridad}`,
    );

    // Convierte el array de mensajes del DTO al formato de Prisma nested create.
    // `creadoEn` se parsea a Date; si no viene, usa el momento actual.
    const mensajesCreate: Prisma.MensajeHistorialCreateWithoutReclamoInput[] = (
      payload.mensajes || []
    ).map((m) => ({
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
      ...this.toResponse(reclamo),
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

  async findAll(payload: FindReclamosDto): Promise<PaginatedReclamosResponse> {
    const where: Prisma.ReclamoWhereInput = {
      contactKey: payload.contactKey || undefined,
      codigoSeguimiento: payload.codigoSeguimiento || undefined,
      estado: payload.estado || undefined,
      categoria: payload.categoria || undefined,
      prioridad: payload.prioridad || undefined,
      municipalityId: payload.municipalityId || undefined,
      areaId: payload.areaId || undefined,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.reclamo.findMany({
        where,
        skip: payload.skip,
        take: payload.limit,
        orderBy: {
          creadoEn: payload.sortDirection === 1 ? 'asc' : 'desc',
        },
      }),
      this.prisma.reclamo.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / payload.limit));

    return {
      items: items.map((item) => ({
        ...this.toResponse(item),
        message: 'Reclamo obtenido correctamente',
        reclamoId: item.id,
        trackingCode: item.codigoSeguimiento,
        status: 'ok',
        createdAt: item.creadoEn.toISOString(),
        data: {
          problema: item.problema,
          direccion: item.direccion,
          lat: item.lat,
          lng: item.lng,
          categoria: item.categoria,
          prioridad: item.prioridad,
        },
      })),
      pagination: {
        page: payload.page,
        limit: payload.limit,
        totalItems,
        totalPages,
        hasNextPage: payload.page < totalPages,
        hasPreviousPage: payload.page > 1,
      },
    };
  }

  async findOne(id: string): Promise<ReclamoCrudResponse> {
    const reclamo = await this.prisma.reclamo.findUnique({
      where: { id },
    });

    if (!reclamo) {
      throw new NotFoundException(`No se encontró reclamo con id=${id}`);
    }

    return {
      ...this.toResponse(reclamo),
      message: 'Reclamo obtenido correctamente',
      reclamoId: reclamo.id,
      trackingCode: reclamo.codigoSeguimiento,
      status: 'ok',
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

  async getHistory(id: string) {
    const reclamo = await this.prisma.reclamo.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!reclamo) {
      throw new NotFoundException(`No se encontró reclamo con id=${id}`);
    }

    return {
      status: 'ok',
      data: await this.prisma.historialAccion.findMany({
        where: { reclamoId: id },
        orderBy: { creadoEn: 'asc' },
      }),
    };
  }

  async publicTracking(payload: PublicTrackingDto) {
    const reclamo = await this.prisma.reclamo.findFirst({
      where: {
        codigoSeguimiento: payload.codigoSeguimiento,
        contactKey: payload.contactKey,
      },
      select: {
        id: true,
        codigoSeguimiento: true,
        estado: true,
        categoria: true,
        actualizadoEn: true,
      },
    });

    if (!reclamo) {
      return { status: 'not_found' as const, data: null };
    }

    return {
      status: 'ok' as const,
      data: {
        trackingCode: reclamo.codigoSeguimiento,
        claimId: reclamo.id,
        status: reclamo.estado,
        category: reclamo.categoria,
        updatedAt: reclamo.actualizadoEn.toISOString(),
      },
    };
  }

  async citizenResponse(payload: CitizenResponseDto) {
    const reclamo = await this.prisma.reclamo.findFirst({
      where: { id: payload.reclamoId, contactKey: payload.contactKey },
    });
    if (!reclamo) return { status: 'not_found', data: null };

    return this.prisma.$transaction(async (tx) => {
      const response = await tx.respuestaCiudadana.create({
        data: {
          reclamoId: reclamo.id,
          tipo: payload.tipo,
          comentario: payload.comentario,
          contactKey: payload.contactKey,
        },
      });
      const updated = await tx.reclamo.update({
        where: { id: reclamo.id },
        data: payload.tipo === 'disconforme' ? { estado: 'en_proceso' } : {},
      });
      await tx.historialAccion.create({
        data: {
          reclamoId: reclamo.id,
          accion: 'citizen.response',
          origen: 'citizen',
          estadoAnterior: reclamo.estado,
          estadoNuevo: updated.estado,
          motivo: payload.comentario,
          referenciaId: response.id,
          metadata: { tipo: payload.tipo },
        },
      });
      return { status: 'ok', data: response };
    });
  }

  async reopen(payload: ReopenReclamoDto) {
    const reclamo = await this.prisma.reclamo.findUnique({
      where: { id: payload.reclamoId },
    });
    if (!reclamo) throw new NotFoundException('Reclamo no encontrado');

    return this.prisma.$transaction(async (tx) => {
      const reopening = await tx.reapertura.create({
        data: {
          reclamoId: reclamo.id,
          actorId: payload.actorId,
          motivo: payload.motivo,
        },
      });
      const updated = await tx.reclamo.update({
        where: { id: reclamo.id },
        data: { estado: 'en_proceso' },
      });
      await tx.historialAccion.create({
        data: {
          reclamoId: reclamo.id,
          accion: 'claim.reopened',
          origen: 'citizen',
          actorId: payload.actorId,
          estadoAnterior: reclamo.estado,
          estadoNuevo: updated.estado,
          motivo: payload.motivo,
          referenciaId: reopening.id,
        },
      });
      return { status: 'ok', data: reopening };
    });
  }

  async citizenReopen(payload: CitizenReopenDto) {
    const reclamo = await this.prisma.reclamo.findFirst({
      where: {
        codigoSeguimiento: payload.trackingCode,
        contactKey: payload.contactKey,
      },
    });
    if (!reclamo) return { status: 'not_found', data: null };

    return this.reopen({
      reclamoId: reclamo.id,
      actorId: undefined,
      motivo: payload.motivo,
    });
  }

  async getPublicTracking(codigoSeguimiento: string) {
    const reclamo = await this.prisma.reclamo.findUnique({
      where: { codigoSeguimiento },
      select: {
        codigoSeguimiento: true,
        estado: true,
        categoria: true,
        creadoEn: true,
        actualizadoEn: true,
      },
    });

    if (!reclamo) {
      throw new NotFoundException('No se encontró un reclamo con ese código');
    }

    return {
      status: 'ok',
      data: {
        trackingCode: reclamo.codigoSeguimiento,
        status: reclamo.estado,
        category: reclamo.categoria,
        createdAt: reclamo.creadoEn.toISOString(),
        updatedAt: reclamo.actualizadoEn.toISOString(),
      },
    };
  }

  async reviewResolution(payload: ReviewResolutionDto) {
    const reclamo = await this.prisma.reclamo.findUnique({
      where: { id: payload.reclamoId },
    });

    if (!reclamo) {
      throw new NotFoundException(
        `No se encontró reclamo con id=${payload.reclamoId}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.revisionResolucion.create({
        data: {
          reclamoId: payload.reclamoId,
          resultado: payload.resultado,
          actorId: payload.actorId,
          comentario: payload.comentario,
        },
      });

      const updated = await tx.reclamo.update({
        where: { id: payload.reclamoId },
        data: payload.resultado === 'rechazada' ? { estado: 'en_proceso' } : {},
      });

      await tx.historialAccion.create({
        data: {
          reclamoId: payload.reclamoId,
          accion: 'resolution.reviewed',
          origen: 'reclamos',
          actorId: payload.actorId,
          estadoAnterior: reclamo.estado,
          estadoNuevo: updated.estado,
          motivo: payload.comentario,
          referenciaId: review.id,
          metadata: { resultado: payload.resultado },
        },
      });

      return { status: 'ok', data: review };
    });
  }

  async requestNewVisit(payload: RequestNewVisitDto) {
    const reclamo = await this.prisma.reclamo.findUnique({
      where: { id: payload.reclamoId },
    });

    if (!reclamo) {
      throw new NotFoundException(
        `No se encontró reclamo con id=${payload.reclamoId}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const visit = await tx.nuevaVisita.create({
        data: {
          reclamoId: payload.reclamoId,
          actorId: payload.actorId,
          motivo: payload.motivo,
          programadaEn: payload.programadaEn
            ? new Date(payload.programadaEn)
            : undefined,
        },
      });

      const updated = await tx.reclamo.update({
        where: { id: payload.reclamoId },
        data: { estado: 'en_proceso' },
      });

      await tx.historialAccion.create({
        data: {
          reclamoId: payload.reclamoId,
          accion: 'new_visit.requested',
          origen: 'reclamos',
          actorId: payload.actorId,
          estadoAnterior: reclamo.estado,
          estadoNuevo: updated.estado,
          motivo: payload.motivo,
          referenciaId: visit.id,
        },
      });

      return { status: 'ok', data: visit };
    });
  }

  async close(payload: CloseReclamoDto) {
    const reclamo = await this.prisma.reclamo.findUnique({
      where: { id: payload.reclamoId },
    });

    if (!reclamo) {
      throw new NotFoundException(
        `No se encontró reclamo con id=${payload.reclamoId}`,
      );
    }

    const latestReview = await this.prisma.revisionResolucion.findFirst({
      where: { reclamoId: payload.reclamoId },
      orderBy: { creadaEn: 'desc' },
    });

    if (!latestReview || latestReview.resultado !== 'aprobada') {
      throw new HttpException(
        'El reclamo requiere una revision de resolucion aprobada antes del cierre',
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.reclamo.update({
        where: { id: payload.reclamoId },
        data: { estado: 'cerrado' },
      });

      await tx.historialAccion.create({
        data: {
          reclamoId: payload.reclamoId,
          accion: 'claim.closed',
          origen: 'reclamos',
          actorId: payload.actorId,
          estadoAnterior: reclamo.estado,
          estadoNuevo: updated.estado,
          motivo: payload.motivo,
          referenciaId: latestReview.id,
        },
      });

      return { status: 'ok', data: updated };
    });
  }

  async update(
    id: string,
    data: UpdateReclamoDto,
  ): Promise<ReclamoCrudResponse> {
    const existing = await this.prisma.reclamo.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`No se encontró reclamo con id=${id}`);
    }

    let resolvedAt: Date | null | undefined;
    if (data.estado === 'resuelto') {
      resolvedAt = new Date();
    } else if (data.estado !== undefined) {
      resolvedAt = null;
    }

    const reclamo = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.reclamo.update({
        where: { id },
        data: {
          problema: data.problema,
          direccion: data.direccion,
          lat: data.lat,
          lng: data.lng,
          categoria: data.categoria,
          prioridad: data.prioridad,
          estado: data.estado,
          observaciones: data.observaciones,
          metadata: data.metadata as Prisma.InputJsonValue | undefined,
          resolvedAt,
        },
      });

      await tx.historialAccion.create({
        data: {
          reclamoId: id,
          accion: data.estado ? 'claim.status_changed' : 'claim.updated',
          origen: data.origen ?? 'reclamos',
          actorId: data.actorId,
          estadoAnterior: existing.estado,
          estadoNuevo: updated.estado,
          motivo: data.observaciones,
          referenciaId: data.referenciaId,
          metadata: data.metadata as Prisma.InputJsonValue | undefined,
        },
      });

      return updated;
    });

    if (data.estado && data.estado !== existing.estado) {
      await this.publishStatusChanged(reclamo, data.actorId);
    }

    return {
      ...this.toResponse(reclamo),
      message: 'Reclamo actualizado correctamente',
      reclamoId: reclamo.id,
      trackingCode: reclamo.codigoSeguimiento,
      status: 'updated',
      createdAt: reclamo.creadoEn.toISOString(),
      data: {
        problema: reclamo.problema,
        direccion: reclamo.direccion,
        lat: reclamo.lat,
        lng: reclamo.lng,
        categoria: reclamo.categoria,
        prioridad: reclamo.prioridad,
        estado: reclamo.estado,
      },
    };
  }

  async remove(
    id: string,
  ): Promise<{ status: string; message: string; id: string }> {
    const existing = await this.prisma.reclamo.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`No se encontró reclamo con id=${id}`);
    }

    await this.prisma.reclamo.delete({ where: { id } });

    return {
      status: 'deleted',
      message: 'Reclamo eliminado correctamente',
      id,
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
              municipalityId: payload.municipalityId ?? null,
              areaId: payload.areaId ?? null,
              observaciones: payload.observaciones ?? null,
              metadata:
                (payload.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
              mensajes: mensajesCreate.length
                ? { create: mensajesCreate }
                : undefined,
            },
          });

          await tx.historialAccion.create({
            data: {
              reclamoId: created.id,
              accion: 'claim.created',
              origen: 'reclamos',
              estadoNuevo: created.estado,
              metadata: { correlationId: payload.correlationId },
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

  private async publishStatusChanged(
    reclamo: Reclamo,
    actorId?: string,
  ): Promise<void> {
    const event: ClaimStatusChangedEvent = {
      version: '1',
      correlationId: reclamo.correlationId,
      idempotencyKey: `${reclamo.id}:${reclamo.actualizadoEn.toISOString()}:${reclamo.estado}`,
      occurredAt: reclamo.actualizadoEn.toISOString(),
      producer: 'ms-reclamos',
      actor: actorId ? { id: actorId } : {},
      municipalityId: reclamo.municipalityId ?? undefined,
      claimId: reclamo.id,
      trackingCode: reclamo.codigoSeguimiento,
      newStatus: reclamo.estado,
      recipientEmail: reclamo.correo ?? undefined,
      recipientPhone:
        reclamo.canal === 'whatsapp'
          ? this.extractWhatsappRecipient(reclamo.contactKey)
          : undefined,
    };

    try {
      await firstValueFrom(
        this.natsClient
          .emit('reclamos.v1.status.changed', event)
          .pipe(timeout(5000)),
      );
    } catch (error: unknown) {
      this.logger.error(
        `[${reclamo.correlationId}] No se pudo publicar reclamos.v1.status.changed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private extractWhatsappRecipient(contactKey: string): string | undefined {
    const [channel, recipient] = contactKey.split(':', 2);
    return channel === 'whatsapp' && recipient ? recipient : undefined;
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
      return (
        target.includes('codigo_seguimiento') ||
        target.includes('codigoSeguimiento')
      );
    }

    return typeof target === 'string' && target.includes('codigo');
  }

  private toResponse(reclamo: Reclamo): ReclamoResponseDto {
    return {
      id: reclamo.id,
      codigoSeguimiento: reclamo.codigoSeguimiento,
      correlationId: reclamo.correlationId,
      contactKey: reclamo.contactKey,
      canal: reclamo.canal,
      correo: reclamo.correo,
      dni: reclamo.dni,
      problema: reclamo.problema,
      direccion: reclamo.direccion,
      lat: reclamo.lat,
      lng: reclamo.lng,
      categoria: reclamo.categoria,
      prioridad: reclamo.prioridad,
      municipalityId: reclamo.municipalityId,
      areaId: reclamo.areaId,
      estado: reclamo.estado,
      observaciones: reclamo.observaciones,
      creadoEn: reclamo.creadoEn,
      actualizadoEn: reclamo.actualizadoEn,
      resolvedAt: reclamo.resolvedAt,
    };
  }
}
