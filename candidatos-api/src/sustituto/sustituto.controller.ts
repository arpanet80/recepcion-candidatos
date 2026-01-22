import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SustitutoService } from './sustituto.service';
// import { CreateSustitutoDto } from './dto/create-sustituto.dto';
import { CreateSustitutoDto } from 'src/sustituto/dto/create-sustituto.dto';
import { UpdateSustitutoDto } from './dto/update-sustituto.dto';
import { Sustituto } from './entities/sustituto.entity';

@Controller('sustitutos')
export class SustitutoController {
  constructor(private readonly service: SustitutoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Get('existe/:ci')
  async existePorCi(@Param('ci') ci: string): Promise<boolean> {
    const existe = await this.service.existePorCi(ci);
    return existe;
  }

  @Get('lista/:partido')
  async listaPorPartido(@Param('partido') partido: string): Promise<Sustituto[]> {
    const existe = await this.service.listaPorPartido(partido);
    return existe;
  }

  @Post()
  create(@Body() dto: CreateSustitutoDto) {
      // console.log('📦 BODY recibido:', JSON.stringify(dto, null, 2));
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSustitutoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}