import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidato } from './entities/candidato.entity';
import { CandidatosService } from './candidatos.service';
import { CandidatosController } from './candidatos.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
        TypeOrmModule.forFeature([Candidato]),
        JwtModule.register({})
],
  controllers: [CandidatosController],
  providers: [CandidatosService],
})
export class CandidatosModule {}