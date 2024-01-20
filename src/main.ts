import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  dotenv.config();
  
  let app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('AIP G-CHOICE')
    .setDescription('Cố mà gọi api nghe mấy cưng')
    .setVersion('1.0')
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  await app.listen(3000);
}

bootstrap();