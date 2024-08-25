import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../shared/prisma.service";
import { randomBytes } from "crypto";
import { EnvService } from "../shared/env.service";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private prismaService: PrismaService,
    private envService: EnvService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post("getCode")
  async generateVerificationCode(@Body() dto: { wovId: string }) {
    if (
      await this.prismaService.account.findFirst({ where: { id: dto.wovId } })
    ) {
      return "account already exists";
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

  @Post("signUp")
  async signUp(
    @Body()
    dto: {
      wovId: string;
      code: string;
      email: string;
      password: string;
    },
  ) {
    if (
      await this.prismaService.account.findFirst({ where: { id: dto.wovId } })
    ) {
      return "account already exists";
    }

    // Check if code is valid
    const code = await this.prismaService.verificationCode.findFirst({
      where: { wovId: dto.wovId, code: dto.code },
    });
    if (!code) {
      return "code not found";
    }
    if (code.validUntil.getTime() < Date.now()) {
      await this.prismaService.verificationCode.delete({ where: code });
      return "code expired";
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
        password: dto.password,
      },
    });

    await this.prismaService.verificationCode.deleteMany({
      where: { wovId: dto.wovId },
    });

    return "account created";
  }

  @Post("signIn")
  async signIn(@Body() dto: { email: string; password: string }) {
    if (
      !(await this.prismaService.account.findFirst({
        where: { email: dto.email, password: dto.password },
      }))
    ) {
      return "invalid credentials";
    }

    return "signed in";
  }
}
