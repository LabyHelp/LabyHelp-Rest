import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {NestExpressApplication} from "@nestjs/platform-express";
import * as cookieParser from 'cookie-parser';
import bodyParser from "body-parser";
import {Logger} from "@nestjs/common";

const logger = new Logger('main');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(cookieParser());

    // app.use(bodyParser.json({
    //     limit: '50mb'
    // }));

    // app.use(bodyParser.urlencoded({extended: true}));

    // SERVE Swagger docs
    const config = new DocumentBuilder()
        .setTitle('Discussion')
        .setDescription('API Documentation for the Discussion API')
        .setVersion('1.0.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port: any = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log(`Started server on port ${port}`);
}

bootstrap();
