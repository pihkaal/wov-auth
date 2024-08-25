import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { EnvService } from "./env.service";

@Module({
  providers: [PrismaService, EnvService],
  exports: [PrismaService, EnvService],
})
export class SharedModule {}
