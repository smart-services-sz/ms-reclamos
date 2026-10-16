import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReclamosModule } from './reclamos/reclamos.module';
import { NatsModule } from './nats/nats.module';
import { AuditLoggingModule } from './audit/audit-logging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NatsModule,
    ReclamosModule,
    AuditLoggingModule,
  ],
})
export class AppModule {}
