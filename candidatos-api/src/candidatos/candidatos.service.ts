import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidato } from './entities/candidato.entity';
import { CreateCandidatoDto } from './dto/create-candidato.dto';
import * as XLSX from 'xlsx';
import { UpdateCandidatoDto } from './dto/update-candidato.dto';

@Injectable()
export class CandidatosService {
  constructor(
    @InjectRepository(Candidato)
    private readonly repo: Repository<Candidato>,
  ) {}

  async findAll(): Promise<Candidato[]> {
    return this.repo.find({
        where: { activo: true, sustituido: false},
        order: { id: "ASC"     }
      });
  }

  async findOne(id: number): Promise<Candidato> {
    const c = await this.repo.findOne({ 
        where: { 
          id,
          activo: true
          },
      });
    if (!c) throw new NotFoundException('Candidato no encontrado');
    return c;
  }

  async create(dto: CreateCandidatoDto): Promise<Candidato> {
    const nuevo = this.repo.create(dto);
    return this.repo.save(nuevo);
  }

  async update(id: number, dto: UpdateCandidatoDto): Promise<Candidato> {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: number): Promise<void> {
    try {
      const tipo  = await this.findOne(id);
      if (!tipo) {
        throw new NotFoundException('No existe el registro solicitado');
      }
      
      await this.repo.update({ id }, {activo: false});

    } catch (error) {
      throw new InternalServerErrorException('No se puedo eliminar el registro:' + error);
    }
  }

  async createMany(data: Partial<Candidato>[]) {
    const chunk = 500;
    for (let i = 0; i < data.length; i += chunk) {
      const slice = data.slice(i, i + chunk);
      await this.repo.insert(slice); // más rápido, sin hooks
    }
  }

  parseExcel(buffer: Buffer): Partial<Candidato>[] {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<any>(sheet);

    return json.map((r) => ({
      nombre_del_partido: r['Nombre del Partido'],
      departamento: r['Departamento'],
      provincia: r['Provincia'],
      municipio: r['Municipio'],
      candidato: r['Candidato'],
      posicion: r['Posición'],
      titularidad: r['Titularidad'],
      nombre_completo: r['Nombre completo'],
      nro_documento: String(r['Nro Documento']),
      genero: r['Género'],
      edad: r['Edad'],
      fecha_nacimiento: r['Fecha Nacimiento'],
      descripcion: r['Descripción'],
      observaciones: r['Observaciones'],
      usuario: r['Usuario'],
      fecha_registro: r['Fecha Registro'],
    }));
  }

  async actualizarSustituido(id: number, sustituido: boolean): Promise<void> {
    await this.repo.update(id, { sustituido });
  }

}