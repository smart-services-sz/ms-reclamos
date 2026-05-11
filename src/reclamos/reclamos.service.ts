import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, Reclamo } from '@prisma/client';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ReclamoResponseDto } from './dto/reclamo-response.dto';
import { FindReclamosDto } from './dto/find-reclamos.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';

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

  constructor(private readonly prisma: PrismaService) {}

  // Persiste el reclamo y su historial de mensajes en PostgreSQL dentro de una
  // única transacción atómica. Si falla cualquier INSERT, Prisma hace rollback automático.
  async create(payload: CreateReclamoDto): Promise<ReclamoCrudResponse> {
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

  async update(id: string, data: UpdateReclamoDto): Promise<ReclamoCrudResponse> {
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

    const reclamo = await this.prisma.reclamo.update({
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

  async remove(id: string): Promise<{ status: string; message: string; id: string }> {
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

  private toResponse(reclamo: Reclamo): ReclamoResponseDto {
    return {
      id: reclamo.id,
      codigoSeguimiento: reclamo.codigoSeguimiento,
      correlationId: reclamo.correlationId,
      contactKey: reclamo.contactKey,
      canal: reclamo.canal as ReclamoResponseDto['canal'],
      correo: reclamo.correo,
      dni: reclamo.dni,
      problema: reclamo.problema,
      direccion: reclamo.direccion,
      lat: reclamo.lat,
      lng: reclamo.lng,
      categoria: reclamo.categoria as ReclamoResponseDto['categoria'],
      prioridad: reclamo.prioridad as ReclamoResponseDto['prioridad'],
      estado: reclamo.estado as ReclamoResponseDto['estado'],
      observaciones: reclamo.observaciones,
      creadoEn: reclamo.creadoEn,
      actualizadoEn: reclamo.actualizadoEn,
      resolvedAt: reclamo.resolvedAt,
    };
  }
}
