import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sustituto } from './entities/sustituto.entity';
import { CreateSustitutoDto } from './dto/create-sustituto.dto';
import { UpdateSustitutoDto } from './dto/update-sustituto.dto';

@Injectable()
export class SustitutoService {
  constructor(
    @InjectRepository(Sustituto)
    private readonly repo: Repository<Sustituto>,
  ) {}

  async findAll(): Promise<Sustituto[]> {
    return this.repo.find({ where: { activo: true }, order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Sustituto> {
    const s = await this.repo.findOne({ where: { id, activo: true } });
    if (!s) throw new NotFoundException('Sustituto no encontrado');
    return s;
  }

  async create(dto: CreateSustitutoDto): Promise<Sustituto> {
    const nuevo = this.repo.create(dto);
    return this.repo.save(nuevo);
  }

  async update(id: number, dto: UpdateSustitutoDto): Promise<Sustituto> {
    const s = await this.findOne(id);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  async remove(id: number): Promise<void> {
    const s = await this.findOne(id);
    await this.repo.update({ id }, { activo: false });
  }

  async existePorCi(ci: string): Promise<boolean> {
    const count = await this.repo.countBy({ nro_documento: ci });
    return count > 0;
  }

  async listaPorPartido(partido: string): Promise<Sustituto[]> {
    const c =  this.repo.find({
        where: { activo: true, 
          nombre_del_partido: partido
        },
        order: { id: "ASC"     }
      });
      
      if (!c) throw new NotFoundException('No se ecencontraron registros');
      return c;
    }
}