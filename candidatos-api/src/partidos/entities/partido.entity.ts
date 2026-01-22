import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Partido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    sigla: string

    @Column()
    activo: boolean
}
