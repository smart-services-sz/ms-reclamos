import { of } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { ReclamosService } from './reclamos.service';

describe('ReclamosService status notifications', () => {
  const actorId = '11111111-1111-4111-8111-111111111111';
  const initialClaim = {
    id: '22222222-2222-4222-8222-222222222222',
    codigoSeguimiento: 'REC-ABC123',
    correlationId: '33333333-3333-4333-8333-333333333333',
    contactKey: 'whatsapp:phone:5493415551234',
    canal: 'whatsapp',
    correo: null,
    municipalityId: 'funes',
    areaId: 'alumbrado',
    estado: 'resuelto',
    actualizadoEn: new Date('2026-10-14T12:00:00.000Z'),
  };

  function makeService(nextStatus: string) {
    const updatedClaim = {
      ...initialClaim,
      estado: nextStatus,
      actualizadoEn: new Date('2026-10-14T12:01:00.000Z'),
    };
    const tx = {
      reclamo: { update: jest.fn().mockResolvedValue(updatedClaim) },
      historialAccion: { create: jest.fn().mockResolvedValue({}) },
      respuestaCiudadana: { create: jest.fn().mockResolvedValue({ id: 'response-1' }) },
      reapertura: { create: jest.fn().mockResolvedValue({ id: 'reopen-1' }) },
      revisionResolucion: { create: jest.fn().mockResolvedValue({ id: 'review-1' }) },
      nuevaVisita: { create: jest.fn().mockResolvedValue({ id: 'visit-1' }) },
    };
    const prisma = {
      reclamo: {
        findFirst: jest.fn().mockResolvedValue(initialClaim),
        findUnique: jest.fn().mockResolvedValue(initialClaim),
      },
      revisionResolucion: {
        findFirst: jest.fn().mockResolvedValue({ resultado: 'aprobada', id: 'review-1' }),
      },
      $transaction: jest.fn((callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)),
    };
    const nats = { emit: jest.fn().mockReturnValue(of(undefined)) };
    const service = new ReclamosService(
      prisma as unknown as PrismaService,
      nats as never,
    );
    return { service, prisma, tx, nats, updatedClaim };
  }

  it.each([
    [
      'citizen disconformity',
      (service: ReclamosService) =>
        service.citizenResponse({
          trackingCode: 'REC-ABC123',
          tipo: 'disconforme',
          contactKey: initialClaim.contactKey,
          comentario: 'Sigue pendiente',
        }),
    ],
    [
      'citizen reopen',
      (service: ReclamosService) =>
        service.citizenReopen({
          trackingCode: 'REC-ABC123',
          contactKey: initialClaim.contactKey,
          motivo: 'Sigue pendiente',
        }),
    ],
    [
      'resolution rejection',
      (service: ReclamosService) =>
        service.reviewResolution({
          reclamoId: initialClaim.id,
          resultado: 'rechazada',
          actorId,
        } as never),
    ],
    [
      'new visit',
      (service: ReclamosService) =>
        service.requestNewVisit({
          reclamoId: initialClaim.id,
          motivo: 'Verificar el trabajo',
          actorId,
        } as never),
    ],
    [
      'administrative close',
      (service: ReclamosService) =>
        service.close({
          reclamoId: initialClaim.id,
          motivo: 'Cierre confirmado',
          actorId,
          municipalityId: initialClaim.municipalityId,
          areaId: initialClaim.areaId,
        } as never),
    ],
  ])('publishes the new state after %s', async (_name, action) => {
    const { service, nats, updatedClaim } = makeService(
      _name === 'administrative close' ? 'cerrado' : 'en_proceso',
    );

    await action(service);

    expect(nats.emit).toHaveBeenCalledWith(
      'reclamos.v1.status.changed',
      expect.objectContaining({
        claimId: initialClaim.id,
        trackingCode: initialClaim.codigoSeguimiento,
        newStatus: updatedClaim.estado,
        recipientPhone: '5493415551234',
        municipalityId: initialClaim.municipalityId,
      }),
    );
  });
});