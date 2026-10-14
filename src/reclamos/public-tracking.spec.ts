import { PrismaService } from '../prisma/prisma.service';
import { ReclamosService } from './reclamos.service';

describe('ReclamosService public tracking', () => {
  let prisma: {
    reclamo: { findFirst: jest.Mock };
  };
  let service: ReclamosService;

  beforeEach(() => {
    prisma = {
      reclamo: { findFirst: jest.fn() },
    };
    service = new ReclamosService(
      prisma as unknown as PrismaService,
      {} as never,
    );
  });

  it('requires the supplied phone to match the tracking code contact', async () => {
    prisma.reclamo.findFirst.mockResolvedValue({
      codigoSeguimiento: 'REC-ABC123',
      estado: 'en_proceso',
      categoria: 'alumbrado',
      actualizadoEn: new Date('2026-10-14T12:00:00.000Z'),
    });

    await expect(
      service.publicTracking({
        codigoSeguimiento: 'REC-ABC123',
        contacto: '+54 9 341 555 1234',
      }),
    ).resolves.toEqual({
      status: 'ok',
      data: {
        trackingCode: 'REC-ABC123',
        status: 'en_proceso',
        category: 'alumbrado',
        updatedAt: '2026-10-14T12:00:00.000Z',
      },
    });

    expect(prisma.reclamo.findFirst).toHaveBeenCalledWith({
      where: {
        codigoSeguimiento: 'REC-ABC123',
        OR: [{ contactKey: { endsWith: ':5493415551234' } }],
      },
      select: {
        codigoSeguimiento: true,
        estado: true,
        categoria: true,
        actualizadoEn: true,
      },
    });
  });

  it('matches a normalized email against the stored email or contact key', async () => {
    prisma.reclamo.findFirst.mockResolvedValue(null);

    await expect(
      service.publicTracking({
        codigoSeguimiento: 'REC-ABC123',
        contacto: 'Citizen@Example.com',
      }),
    ).resolves.toEqual({ status: 'not_found', data: null });

    expect(prisma.reclamo.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          codigoSeguimiento: 'REC-ABC123',
          OR: [
            { correo: 'citizen@example.com' },
            { contactKey: { endsWith: ':citizen@example.com' } },
          ],
        },
      }),
    );
  });
});