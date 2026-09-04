import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReclamosModule } from './reclamos/reclamos.module';
import { NatsModule } from './nats/nats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NatsModule,
    ReclamosModule,
  ],
})
export class AppModule {}
