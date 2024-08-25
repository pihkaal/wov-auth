import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  generateVerificationCode(username: string) {}
}
