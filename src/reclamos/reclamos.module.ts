import { Module } from '@nestjs/common';
import { ReclamosController } from './reclamos.controller';
import { ReclamosService } from './reclamos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [PrismaModule, NatsModule],
  controllers: [ReclamosController],
  providers: [ReclamosService],
})
export class ReclamosModule {}
