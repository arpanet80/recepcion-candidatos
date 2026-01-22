import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sustituto } from './entities/sustituto.entity';
import { SustitutoService } from './sustituto.service';
import { SustitutoController } from './sustituto.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Sustituto]), JwtModule.register({})],
  controllers: [SustitutoController],
  providers: [SustitutoService],
  exports: [SustitutoService], 
})
export class SustitutoModule {}