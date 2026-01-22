import { Sustituto } from 'src/sustituto/entities/sustituto.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('requisitos')
export class Requisito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idsustituto: number;

  @ManyToOne(() => Sustituto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idsustituto' })
  sustituto: Sustituto;

  @Column({ type: 'boolean', default: false })
  certificadonac: boolean;

  @Column({ nullable: true })
  certificadonacobs: string;

  @Column({ type: 'boolean', default: false })
  cedulacopia: boolean;

  @Column({ nullable: true })
  cedulacopiaobs: string;

  @Column({ type: 'boolean', default: false })
  libretamilitarcopia: boolean;

  @Column({ nullable: true })
  libretamilitarcopiaobs: string;

  @Column({ type: 'boolean', default: false })
  solvenciafiscal: boolean;

  @Column({ nullable: true })
  solvenciafiscalobs: string;

  @Column({ type: 'boolean', default: false })
  rejap: boolean;

  @Column({ nullable: true })
  rejapobs: string;

  @Column({ type: 'boolean', default: false })
  declaracionnotarial: boolean;

  @Column({ nullable: true })
  declaracionnotarialobs: string;

  @Column({ type: 'boolean', default: false })
  padron: boolean;

  @Column({ nullable: true })
  padronobs: string;

  @Column({ type: 'boolean', default: false })
  certidiomas: boolean;

  @Column({ nullable: true })
  certidiomasobs: string;

  @Column({ type: 'boolean', default: false })
  cenvi: boolean;

  @Column({ nullable: true })
  cenviobs: string;

  @Column({ type: 'boolean', default: false })
  declaraciondomicilio: boolean;

  @Column({ nullable: true })
  declaraciondomicilioobs: string;

  @Column({ nullable: true })
  whastapp: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecharegistro: Date;
}