import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { PartidosModule } from './partidos/partidos.module';
import { AuthModule } from './auth/auth.module';
import { CandidatosModule } from './candidatos/candidatos.module';
import { SustitutoModule } from './sustituto/sustituto.module';
import { RequisitosModule } from './requisitos/requisitos.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DatabaseModule,
    PartidosModule,
    CandidatosModule,
    SustitutoModule,
    RequisitosModule,
    ReportesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

