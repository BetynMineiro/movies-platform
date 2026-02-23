import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TracingInterceptor } from './common/interceptors/tracing.interceptor';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    app.get(TracingInterceptor),
    app.get(LoggingInterceptor),
  );

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
