import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [TaskModule], // EFC: Impacta muy poco inyectar el módulo de task
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
