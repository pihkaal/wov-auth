import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GenerateVerificationCodeDto } from "./dto/generate-verification-code.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("getCode")
  @HttpCode(HttpStatus.CREATED)
  async generateVerificationCode(@Body() dto: GenerateVerificationCodeDto) {
    return this.authService.generateVerificationCode(dto);
  }

  @Post("signUp")
  @HttpCode(HttpStatus.CREATED)
  signUp(
    @Body()
    dto: SignUpDto,
  ) {
    return this.authService.signUp(dto);
  }

  @Post("signIn")
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }
}
