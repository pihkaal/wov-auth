import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { envSchema } from "./env";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
