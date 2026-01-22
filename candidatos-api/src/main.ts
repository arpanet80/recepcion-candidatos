import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // Habilita CORS
  app.enableCors();

  // Amplia el tamaño que se recibe en el BOSY, sin esto peticiones grandes dan error 413 (Payload Too Large) 
  app.use(json({ limit: '50mb' }));

  // Agrega validadores para los DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Agrega Swagger
  const options = new DocumentBuilder()
    .setTitle('Nest Workshop')
    .setDescription('Nest Workshop')
    .setVersion('1.0')
   .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`🚀 Backend running on: http://localhost:${port}`);
  console.log(`🌐 CORS enabled for: http://localhost:4200`);
}
bootstrap();
