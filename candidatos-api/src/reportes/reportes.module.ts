import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { SustitutoModule } from '../sustituto/sustituto.module';
import { RequisitosModule } from '../requisitos/requisitos.module';

@Module({
  imports: [SustitutoModule, RequisitosModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}