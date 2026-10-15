import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReclamosService } from './reclamos.service';

describe('ReclamosService territorial scope', () => {
  const municipalityId = 'municipality-a';
  const areaId = 'area-a';
  let prisma: {
    reclamo: Record<string, jest.Mock>;
    historialAccion: Record<string, jest.Mock>;
    $transaction: jest.Mock;
  };
  let service: ReclamosService;

  beforeEach(() => {
    prisma = {
      reclamo: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
        delete: jest.fn(),
      },
      historialAccion: { findMany: jest.fn().mockResolvedValue([]) },
      $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
    };
    service = new ReclamosService(
      prisma as unknown as PrismaService,
      {} as never,
    );
  });

  it('filters list results and counts by municipality and area', async () => {
    await service.findAll({
      page: 1,
      limit: 10,
      skip: 0,
      municipalityId,
      areaId,
    } as never);

    expect(prisma.reclamo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ municipalityId, areaId }),
      }),
    );
    expect(prisma.reclamo.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ municipalityId, areaId }),
    });
  });

  it('returns only validated possible-duplicate suggestions from metadata', async () => {
    prisma.reclamo.findMany.mockResolvedValue([
      {
        id: 'claim-new',
        codigoSeguimiento: 'REC-NEW123',
        correlationId: 'correlation-new',
        contactKey: 'whatsapp:phone:5493415551234',
        canal: 'whatsapp',
        correo: null,
        dni: null,
        problema: 'Luminaria apagada',
        direccion: 'San Martin 123, Funes',
        lat: -32.91,
        lng: -60.81,
        categoria: 'alumbrado',
        prioridad: 'media',
        municipalityId,
        areaId,
        estado: 'pendiente',
        observaciones: null,
        metadata: {
          posiblesDuplicados: [
            {
              reclamoId: 'claim-old',
              codigoSeguimiento: 'REC-OLD123',
              problema: 'Luz apagada',
              direccion: 'San Martin 123',
              estado: 'en_proceso',
              distanciaMetros: 12,
              similitud: 87,
              contactKey: 'private-value-must-not-be-returned',
            },
            { codigoSeguimiento: 'invalid-candidate' },
          ],
          source: 'whatsapp',
        },
        creadoEn: new Date('2026-10-15T10:00:00.000Z'),
        actualizadoEn: new Date('2026-10-15T10:00:00.000Z'),
        resolvedAt: null,
      },
    ] as never);

    const response = await service.findAll({
      page: 1,
      limit: 10,
      skip: 0,
      municipalityId,
      areaId,
    } as never);

    expect(response.items[0].posiblesDuplicados).toEqual([
      {
        reclamoId: 'claim-old',
        codigoSeguimiento: 'REC-OLD123',
        problema: 'Luz apagada',
        direccion: 'San Martin 123',
        estado: 'en_proceso',
        distanciaMetros: 12,
        similitud: 87,
      },
    ]);
    expect(JSON.stringify(response.items[0].posiblesDuplicados)).not.toContain(
      'private-value',
    );
  });

  it('treats a claim outside the tenant scope as not found', async () => {
    await expect(
      service.findOne('claim-id', { municipalityId, areaId }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.reclamo.findFirst).toHaveBeenCalledWith({
      where: { id: 'claim-id', municipalityId, areaId },
    });
  });

  it('does not expose history for a claim outside the tenant scope', async () => {
    await expect(
      service.getHistory('claim-id', { municipalityId, areaId }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.historialAccion.findMany).not.toHaveBeenCalled();
  });

  it.each([
    [
      'resolution review',
      (service: ReclamosService) =>
        service.reviewResolution({
          reclamoId: 'claim-id',
          resultado: 'aprobada',
          actorId: '11111111-1111-4111-8111-111111111111',
          municipalityId,
          areaId,
        } as never),
    ],
    [
      'new visit',
      (service: ReclamosService) =>
        service.requestNewVisit({
          reclamoId: 'claim-id',
          motivo: 'Verificar',
          actorId: '11111111-1111-4111-8111-111111111111',
          municipalityId,
          areaId,
        } as never),
    ],
    [
      'close',
      (service: ReclamosService) =>
        service.close({
          reclamoId: 'claim-id',
          motivo: 'Cierre',
          actorId: '11111111-1111-4111-8111-111111111111',
          municipalityId,
          areaId,
        } as never),
    ],
    [
      'update',
      (service: ReclamosService) =>
        service.update('claim-id', {}, { municipalityId, areaId }),
    ],
    [
      'delete',
      (service: ReclamosService) =>
        service.remove('claim-id', { municipalityId, areaId }),
    ],
  ])('blocks %s outside the tenant scope', async (_name, operation) => {
    await expect(operation(service)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.reclamo.findFirst).toHaveBeenCalledWith({
      where: { id: 'claim-id', municipalityId, areaId },
    });
    expect(prisma.reclamo.update).not.toHaveBeenCalled();
    expect(prisma.reclamo.delete).not.toHaveBeenCalled();
  });
});