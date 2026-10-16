import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReclamosService } from './reclamos.service';

describe('ReclamosService metrics', () => {
  const prisma = {
    reclamo: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };
  let service: ReclamosService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.reclamo.count
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(8);
    prisma.reclamo.groupBy
      .mockResolvedValueOnce([{ estado: 'pendiente', _count: { _all: 5 } }, { estado: 'resuelto', _count: { _all: 7 } }])
      .mockResolvedValueOnce([{ categoria: 'alumbrado', _count: { _all: 12 } }])
      .mockResolvedValueOnce([{ prioridad: 'alta', _count: { _all: 4 } }])
      .mockResolvedValueOnce([{ canal: 'web', _count: { _all: 12 } }])
      .mockResolvedValueOnce([{ areaId: 'centro', _count: { _all: 12 } }]);
    prisma.$queryRaw
      .mockResolvedValueOnce([{ period: new Date('2026-10-15T00:00:00.000Z'), total: 12 }])
      .mockResolvedValueOnce([{ averageHours: 4.5, medianHours: 3.25 }]);
    service = new ReclamosService(prisma as unknown as PrismaService, {} as never);
  });

  it('requires municipality scope before running any aggregate query', async () => {
    await expect(service.getMetrics({ from: '2026-10-01', to: '2026-10-16' } as never))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.reclamo.count).not.toHaveBeenCalled();
    expect(prisma.reclamo.groupBy).not.toHaveBeenCalled();
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('applies municipality and area filters to breakdowns and time series without selecting personal fields', async () => {
    const result = await service.getMetrics({
      municipalityId: 'funes', areaId: 'centro',
      from: '2026-10-01', to: '2026-10-16',
      estado: 'resuelto', categoria: 'alumbrado', prioridad: 'alta', canal: 'web',
      bucketDays: 1,
    });

    const expectedWhere = expect.objectContaining({
      municipalityId: 'funes', areaId: 'centro', estado: 'resuelto',
      categoria: 'alumbrado', prioridad: 'alta', canal: 'web',
      creadoEn: { gte: new Date('2026-10-01T00:00:00.000Z'), lt: new Date('2026-10-17T00:00:00.000Z') },
    });
    expect(prisma.reclamo.count).toHaveBeenNthCalledWith(1, { where: expectedWhere });
    for (const call of prisma.reclamo.groupBy.mock.calls) {
      expect(call[0].where).toEqual(expectedWhere);
    }
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(result)).not.toContain('contactKey');
    expect(JSON.stringify(result)).not.toContain('direccion');
    expect(result).toMatchObject({
      municipalityId: 'funes',
      summary: {
        total: 12, previousTotal: 8, open: 5, resolved: 7,
        averageResolutionHours: 4.5, medianResolutionHours: 3.25,
      },
      byArea: [{ name: 'centro', total: 12 }],
      timeline: [{ period: '2026-10-15T00:00:00.000Z', total: 12 }],
    });
  });

  it('rejects ranges longer than one year before querying', async () => {
    await expect(service.getMetrics({
      municipalityId: 'funes', from: '2024-01-01', to: '2026-10-16',
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.reclamo.count).not.toHaveBeenCalled();
  });
});