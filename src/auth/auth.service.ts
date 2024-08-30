import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { EnvService } from "../shared/env.service";
import { PrismaService } from "../shared/prisma.service";
import { GenerateVerificationCodeDto } from "./dto/generate-verification-code.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { compare, hash } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private envService: EnvService,
  ) {}

  async generateVerificationCode(dto: GenerateVerificationCodeDto) {
    if (
      await this.prismaService.account.findFirst({ where: { id: dto.wovId } })
    ) {
      throw new BadRequestException("Account already exists");
    }

    // code valid for 15 minutes
    const validUntil = new Date(Date.now() + 15 * 60 * 1000);
    const code = `<${randomBytes(
      Math.ceil(this.envService.get("AUTH_CODE_LENGTH") / 2),
    )
      .toString("hex")
      .slice(0, this.envService.get("AUTH_CODE_LENGTH"))}>`;

    return await this.prismaService.verificationCode.create({
      data: { wovId: dto.wovId, code, validUntil },
    });
  }

  async signUp(dto: SignUpDto): Promise<void> {
    if (
      await this.prismaService.account.findFirst({ where: { id: dto.wovId } })
    ) {
      throw new BadRequestException("Account already exists");
    }

    // Check if code is valid
    const code = await this.prismaService.verificationCode.findFirst({
      where: { wovId: dto.wovId, code: dto.code },
    });
    if (!code) {
      throw new BadRequestException("Invalid code: Not found");
    }
    if (code.validUntil.getTime() < Date.now()) {
      await this.prismaService.verificationCode.delete({ where: code });
      throw new BadRequestException("Invalid code: Expired");
    }

    // Check in profile message
    const result = await fetch(
      `https://api.wolvesville.com/players/${dto.wovId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bot ${this.envService.get("WOV_API_KEY")}`,
          "Content-Type": "application/json",
        },
      },
    );

    type Player = {
      id: string;
      personalMessage: string;
    };

    const player: Player = await result.json();
    /*if (!player.personalMessage.includes(code.id)) {
      console.log("invalid code")
      return;
    }*/

    await this.prismaService.account.create({
      data: {
        id: dto.wovId,
        email: dto.email,
        password: await hash(dto.password, 10),
      },
    });

    await this.prismaService.verificationCode.deleteMany({
      where: { wovId: dto.wovId },
    });
  }

  async signIn(dto: SignInDto) {
    const account = await this.prismaService.account.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (!account) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!(await compare(dto.password, account.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return "ok";
  }
}
