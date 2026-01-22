import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('candidatos')
export class Candidato {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre_del_partido: string;

  @Column()
  departamento: string;

  @Column({ nullable: true })
  provincia: string;

  @Column({ nullable: true })
  municipio: string;

  @Column()
  candidato: string;

  @Column()
  posicion: number;

  @Column()
  titularidad: string;

  @Column()
  nombre_completo: string;

  @Column()
  nro_documento: string;

  @Column()
  genero: string;

  @Column()
  edad: number;

  @Column()
  fecha_nacimiento: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  observaciones: string;

  @Column()
  usuario: string;

  @Column()
  fecha_registro: string;

  @Column()
  estado: string

  @Column()
  activo: boolean

  @Column()
  sustituido: boolean
}