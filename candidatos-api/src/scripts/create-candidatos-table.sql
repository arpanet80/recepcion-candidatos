-- Crear tabla candidatos
CREATE TABLE candidatos (
    id SERIAL PRIMARY KEY,
    nombre_del_partido VARCHAR(255) NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    provincia VARCHAR(255),
    municipio VARCHAR(255),
    candidato VARCHAR(255) NOT NULL,
    posicion INTEGER NOT NULL,
    titularidad VARCHAR(50) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    nro_documento VARCHAR(50) NOT NULL,
    genero VARCHAR(10) NOT NULL,
    edad INTEGER NOT NULL,
    fecha_nacimiento VARCHAR(20),
    descripcion TEXT,
    observaciones TEXT,
    usuario VARCHAR(255) NOT NULL,
    fecha_registro VARCHAR(20)
);

-- Índice opcional para búsquedas rápidas por documento
CREATE INDEX idx_candidatos_nro_documento ON candidatos(nro_documento);