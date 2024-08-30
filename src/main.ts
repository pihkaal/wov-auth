import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { EnvService } from "./shared/env.service";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const cfg = app.get(EnvService);
  await app.listen(cfg.get("PORT"));
}
bootstrap();
