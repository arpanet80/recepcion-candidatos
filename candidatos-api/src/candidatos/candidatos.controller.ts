import { Controller,Get,Post,Put,Delete,Body,Param,UploadedFile,UseInterceptors, Patch, ParseIntPipe,} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatosService } from './candidatos.service';
import { CreateCandidatoDto } from './dto/create-candidato.dto';
import { UpdateCandidatoDto } from './dto/update-candidato.dto';

@Controller('candidatos')
export class CandidatosController {
  constructor(private readonly service: CandidatosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateCandidatoDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCandidatoDto) {
    return this.service.update(+id, dto);
  }

  @Patch(':id/sustituido')
  async marcarSustituido(
    @Param('id', ParseIntPipe) id: number,
    @Body('sustituido') sustituido: boolean,
  ): Promise<void> {
    await this.service.actualizarSustituido(id, sustituido);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Post('importar')
  @UseInterceptors(FileInterceptor('file'))
  async importar(@UploadedFile() file: Express.Multer.File) {
    const data = this.service.parseExcel(file.buffer);
    await this.service.createMany(data);
    return { message: 'Candidatos importados correctamente', count: data.length };
  }
}