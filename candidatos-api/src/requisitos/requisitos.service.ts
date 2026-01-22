import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisito } from './entities/requisito.entity';
import { CreateRequisitoDto } from './dto/create-requisito.dto';
import { UpdateRequisitoDto } from './dto/update-requisito.dto';

@Injectable()
export class RequisitoService {
  constructor(
    @InjectRepository(Requisito)
    private readonly repo: Repository<Requisito>,
  ) {}

  async findAll(): Promise<Requisito[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Requisito> {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Requisito no encontrado');
    return r;
  }

  async create(dto: CreateRequisitoDto): Promise<Requisito> {
    const nuevo = this.repo.create(dto);
    return this.repo.save(nuevo);
  }

  async update(id: number, dto: UpdateRequisitoDto): Promise<Requisito> {
    const r = await this.findOne(id);
    Object.assign(r, dto);
    return this.repo.save(r);
  }

  async remove(id: number): Promise<void> {
    const r = await this.findOne(id);
    await this.repo.remove(r);
  }

  /**
 * Devuelve el registro de requisitos asociado a un sustituto
 * (relación 1-a-1)
 */
async findBySustituto(idsustituto: number): Promise<Requisito> {
  const req = await this.repo.findOne({ where: { idsustituto } });
  if (!req) throw new NotFoundException('Requisitos no encontrados para este sustituto');
  return req;
}
}