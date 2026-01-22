import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sustituto')
export class Sustituto {
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
  edad: string;

  @Column({ type: 'date' })
  fecha_nacimiento: string;

  @Column({ nullable: true, type: 'text' })
  descripcion: string;

  @Column({ nullable: true, type: 'text' })
  observaciones: string;

  @Column()
  usuario: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @Column()
  estado?: string;

  @Column({ default: true })
  activo?: boolean;

}