import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReclamosModule } from './reclamos/reclamos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ReclamosModule,
  ],
})
export class AppModule {}
