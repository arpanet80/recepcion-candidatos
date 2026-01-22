import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            url: `postgresql://${configService.get('POSTGRES_USER')}:${configService.get('POSTGRES_PASSWORD')}@${configService.get('POSTGRES_HOST')}:${configService.get('POSTGRES_PORT')}/${configService.get('POSTGRES_DB')}?options=-c%20search_path=${configService.get('POSTGRES_PATH')}`,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: false, // Si pone en true ELIMINA TODO y realiza migraciones automáticamente para que su base de datos sea idéntica a su modelado
          }),
          inject: [ConfigService],
        }),
      ],
})
export class DatabaseModule {}




