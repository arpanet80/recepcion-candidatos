import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requisito } from './entities/requisito.entity';
import { RequisitoController } from './requisitos.controller';
import { RequisitoService } from './requisitos.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Requisito]), JwtModule.register({})],
  controllers: [RequisitoController],
  providers: [RequisitoService],
  exports: [RequisitoService], 
})
export class RequisitosModule {}