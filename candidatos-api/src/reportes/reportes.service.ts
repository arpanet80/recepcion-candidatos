import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as PizZip from 'pizzip';
import * as Docxtemplater from 'docxtemplater';
import { Info } from './entities/info.model';
import { DatosActa } from './entities/datos-acta.interface';

@Injectable()
export class ReportesService {
  /**
   * Genera el Word en memoria a partir de la plantilla
   */
  async generarSustitutoWord(datos: {info: Info; }): Promise<Buffer> {
    const templatePath = path.join(__dirname, '..', 'templates','templates', 'sustituto.docx');

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '[[', end: ']]' },
    });

    // Rellenamos la plantilla
    doc.render({
      ...datos.info,
    });

    // Devolvemos el buffer (sin escribir archivo)
    return doc.getZip().generate({ type: 'nodebuffer' });
  }

  async generarActaWord(datos: {
    info: DatosActa;
  }): Promise<Buffer> {
    const templatePath = path.join(__dirname, '..', 'templates', 'templates', 'acta.docx');
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '[[', end: ']]' },
    });

    doc.render({
      ...datos.info,
    });

    return doc.getZip().generate({ type: 'nodebuffer' });
  }
}