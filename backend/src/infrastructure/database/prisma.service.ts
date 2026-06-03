import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv'; // 👈 1. Importa dotenv de forma nativa
import * as path from 'path';

// 2. Forzamos la lectura del archivo .env según la ubicación real en tu proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

let globalPool: Pool | undefined;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: PrismaClient;

  constructor() {
    if (!globalPool) {
      globalPool = new Pool({
        // ✅ Ahora sí tendrá la cadena de texto válida del archivo .env
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      globalPool.on('error', (err) => {
        console.error('Error inesperado en el pool de PostgreSQL:', err);
      });
    }

    const adapter = new PrismaPg(globalPool);
    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
