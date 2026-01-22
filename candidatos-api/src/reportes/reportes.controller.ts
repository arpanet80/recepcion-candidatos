import { Body, Controller, Get, Param, ParseIntPipe, Post, Res, } from '@nestjs/common';
import { Response } from 'express';
import { ReportesService } from './reportes.service';
import { SustitutoService } from '../sustituto/sustituto.service';
import { RequisitoService } from '../requisitos/requisitos.service';
import { Info } from './entities/info.model';
import { DatosActa } from './entities/datos-acta.interface';

@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
    private readonly sustitutoService: SustitutoService,
    private readonly requisitoService: RequisitoService,
  ) {}

  @Get('sustituto/:id/word')
  async descargarWord(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    // 1. Obtener datos
    const sustituto = await this.sustitutoService.findOne(id);
    const requisito = await this.requisitoService.findBySustituto(id);

    const INFO_REGISTRO: Info = {
      nombre_completo: sustituto.nombre_completo,
      candidato: sustituto.candidato,
      nombre_del_partido: this.toCamelCase(sustituto.nombre_del_partido),
      posicion: sustituto.posicion.toString(),
      titularidad: sustituto.titularidad,

      certificadonacSI: requisito.certificadonac == true ? 'X' : '',
      certificadonacNO: requisito.certificadonac == false ? 'X' : '',
      certificadonacobs: requisito.certificadonacobs,

      cedulacopiaSI: requisito.cedulacopia == true ? 'X' : '',
      cedulacopiaNO: requisito.cedulacopia == false ? 'X' : '',
      cedulacopiaobs: requisito.cedulacopiaobs,

      libretamilitarcopiaSI: requisito.libretamilitarcopia == true ? 'X' : '',
      libretamilitarcopiaNO: requisito.libretamilitarcopia == false ? 'X' : '',
      libretamilitarcopiaobs: requisito.libretamilitarcopiaobs,

      solvenciafiscalSI: requisito.solvenciafiscal == true ? 'X' : '',
      solvenciafiscalNO: requisito.solvenciafiscal == false ? 'X' : '',
      solvenciafiscalobs: requisito.solvenciafiscalobs,

      rejapSI: requisito.rejap == true ? 'X' : '',
      rejapNO: requisito.rejap == false ? 'X' : '',
      rejapobs: requisito.rejapobs,

      declaracionnotarialSI: requisito.declaracionnotarial == true ? 'X' : '',
      declaracionnotarialNO: requisito.declaracionnotarial == false ? 'X' : '',
      declaracionnotarialobs: requisito.declaracionnotarialobs,

      padronSI: requisito.padron == true ? 'X' : '',
      padronNO: requisito.padron == false ? 'X' : '',
      padronobs: requisito.padronobs,

      certidiomasSI: requisito.certidiomas == true ? 'X' : '',
      certidiomasNO: requisito.certidiomas == false ? 'X' : '',
      certidiomasobs: requisito.certidiomasobs,

      cenviSI: requisito.cenvi == true ? 'X' : '',
      cenviNO: requisito.cenvi == false ? 'X' : '',
      cenviobs: requisito.cenviobs,

      declaraciondomicilioSI: requisito.declaraciondomicilio == true ? 'X' : '',
      declaraciondomicilioNO: requisito.declaraciondomicilio == false ? 'X' : '',
      declaraciondomicilioobs: requisito.declaraciondomicilioobs,

      whastapp: requisito.whastapp,
      fecha: this.formatearFechaEs(requisito.fecharegistro.toString())
    }
      

    // 2. Generar Word
    const buffer = await this.reportesService.generarSustitutoWord({
      // sustituto,
      // requisito,
      info: INFO_REGISTRO,
    });

    // 3. Headers para abrir en navegador (inline)
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `inline; filename="sustituto_${sustituto.nro_documento}.docx"`,
    });

    // 4. Enviar buffer (sin guardar archivo)
    res.end(buffer);
  }

  @Post('acta/word')
  async descargarActaWord(
    @Body() dto: DatosActa, // ← objeto completo
    @Res() res: Response,
  ) {

    dto.fechaTexto = this.fechaAEspanol(dto.fecha);

    const sustitutosLista = await this.sustitutoService.listaPorPartido(dto.nombre_del_partido.toUpperCase());

    dto.sustituto = sustitutosLista;

    // 2. Generar Word
    const buffer = await this.reportesService.generarActaWord({
      info: dto,
    });

    // 3. Devolver Word inline (se abre en nueva pestaña)
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `inline; filename="acta_${dto.cedula_delegado}.docx"`,
    });
    res.end(buffer);

  }


  formatearFechaEs(fechaStr: string): string {
    const date = new Date(fechaStr);
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();

    // Ejemplo: "22 de enero de 2026"
    return `${dia} de ${mes} de ${anio}`;
  }

  toCamelCase(str: string): string {
    return str
      .trim()
      .split(/[\s]+/) // separa por espacios
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '); // respeta espacios
  }

  fechaAEspanol(fechaStr: string): string {
    // 1. Parsea el string "21/1/2025"
    const [dia, mes, anio] = fechaStr.split('/').map(Number);
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    // 2. Devuelve formato español
    return `${dia} de ${meses[mes - 1]} de ${anio}`;
  }

}