import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { ReclamosService } from './reclamos.service';

@Controller()
export class ReclamosController {
  private readonly logger = new Logger(ReclamosController.name);

  constructor(private readonly reclamosService: ReclamosService) {}

  // Suscriptor NATS del tópico 'reclamos.create'.
  // Recibe el payload completo desde ms-ai (datos del reclamo + historial de mensajes)
  // y lo persiste en PostgreSQL vía Prisma dentro de una transacción atómica.
  @MessagePattern('reclamos.create')
  async create(@Payload() payload: CreateReclamoDto) {
    this.logger.log(
      `[${payload.correlationId}] Tópico reclamos.create recibido | contactKey=${payload.contactKey} | canal=${payload.canal}`,
    );
    this.logger.debug(
      `[${payload.correlationId}] Payload completo:\n${JSON.stringify(payload, null, 2)}`,
    );
    return this.reclamosService.create(payload);
  }
}
