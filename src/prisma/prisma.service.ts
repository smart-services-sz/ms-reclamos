import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Wrapper de PrismaClient como servicio NestJS singleton.
// Prisma 7 requiere un driver adapter explícito cuando el datasource no incluye 'url'.
// PrismaPg inyecta el pool de conexiones de `pg` directamente, sin el proxy de Prisma.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // DATABASE_URL se carga antes del bootstrap de NestJS mediante `import 'dotenv/config'` en main.ts.
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect(); // Establece el pool de conexiones al iniciar el módulo.
    this.logger.log('Prisma conectado a la base de datos');
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Libera el pool de conexiones al cerrar la aplicación.
  }
}
