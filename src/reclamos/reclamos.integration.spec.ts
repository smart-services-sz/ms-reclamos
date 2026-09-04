import { PrismaService } from '../prisma/prisma.service';
import { ReclamosService } from './reclamos.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';

const describeIntegration =
  process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip;

describeIntegration('ReclamosService CORE 3 integration', () => {
  jest.setTimeout(30000);
  let prisma: PrismaService;
  let service: ReclamosService;
  let reclamoId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new ReclamosService(prisma, {
      emit: jest.fn().mockReturnValue({ pipe: () => ({}) }),
    } as never);
  });

  afterAll(async () => {
    if (reclamoId) {
      await prisma.reclamo.delete({ where: { id: reclamoId } });
    }

    await prisma.onModuleDestroy();
  });

  it('requires approved resolution review before closing and preserves the full history', async () => {
    const actorId = '11111111-1111-4111-8111-111111111111';
    const payload: CreateReclamoDto = {
      correlationId: '22222222-2222-4222-8222-222222222222',
      contactKey: `integration:${Date.now()}`,
      canal: 'manual',
      problema: 'Reclamo de integracion CORE 3',
      direccion: 'Calle de Integracion 123',
      lat: -34.55,
      lng: -58.45,
      categoria: 'alumbrado',
      prioridad: 'media',
      municipalityId: 'municipio_integracion',
      areaId: 'area_integracion',
    };

    const created = await service.create(payload);
    reclamoId = created.reclamoId;

    await expect(
      service.close({
        reclamoId,
        motivo: 'Cierre sin revision',
        actorId,
      }),
    ).rejects.toMatchObject({ status: 409 });

    await expect(
      service.reviewResolution({
        reclamoId,
        resultado: 'rechazada',
        comentario: 'La evidencia no alcanza para aprobar la resolucion',
        actorId,
      }),
    ).resolves.toMatchObject({ status: 'ok' });

    await expect(
      service.requestNewVisit({
        reclamoId,
        motivo: 'Se requiere una nueva visita de verificacion',
        actorId,
      }),
    ).resolves.toMatchObject({ status: 'ok' });

    await expect(
      service.reviewResolution({
        reclamoId,
        resultado: 'aprobada',
        comentario: 'Resolucion verificada',
        actorId,
      }),
    ).resolves.toMatchObject({ status: 'ok' });

    await expect(
      service.close({
        reclamoId,
        motivo: 'Cierre administrativo posterior a revision',
        actorId,
      }),
    ).resolves.toMatchObject({
      status: 'ok',
      data: { estado: 'cerrado' },
    });

    const history = await service.getHistory(reclamoId);
    const actions = history.data.map((entry) => entry.accion);

    expect(actions).toEqual(
      expect.arrayContaining([
        'claim.created',
        'resolution.reviewed',
        'new_visit.requested',
        'claim.closed',
      ]),
    );
    expect(history.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          origen: 'reclamos',
          actorId,
        }),
      ]),
    );
  });
});
