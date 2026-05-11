import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { ReclamosService } from './reclamos.service';
import { FindReclamosDto } from './dto/find-reclamos.dto';
import { ReclamoIdDto } from './dto/reclamo-id.dto';
import { UpdateReclamoCommandDto } from './dto/update-reclamo.dto';

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

  @MessagePattern('reclamos.find-all')
  async findAll(@Payload() payload: FindReclamosDto) {
    this.logger.log(
      `Tópico reclamos.find-all recibido | page=${payload.page} | limit=${payload.limit}`,
    );
    return this.reclamosService.findAll(payload);
  }

  @MessagePattern('reclamos.find-one')
  async findOne(@Payload() payload: ReclamoIdDto) {
    this.logger.log(`Tópico reclamos.find-one recibido | id=${payload.id}`);
    return this.reclamosService.findOne(payload.id);
  }

  @MessagePattern('reclamos.update')
  async update(@Payload() payload: UpdateReclamoCommandDto) {
    this.logger.log(`Tópico reclamos.update recibido | id=${payload.id}`);
    return this.reclamosService.update(payload.id, payload.data);
  }

  @MessagePattern('reclamos.remove')
  async remove(@Payload() payload: ReclamoIdDto) {
    this.logger.log(`Tópico reclamos.remove recibido | id=${payload.id}`);
    return this.reclamosService.remove(payload.id);
  }
}
