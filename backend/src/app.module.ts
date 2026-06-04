import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './modules/task/task.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './shared/auth/roles.guard';
import { JwtAuthGuard } from './shared/auth/jwt-auth.guard';

@Module({
  imports: [TaskModule], // EFC: Impacta muy poco inyectar el módulo de task
  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // EFC: primero autenticas
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, //EFC: Después se validan roles
    },
  ],
})
export class AppModule {}
