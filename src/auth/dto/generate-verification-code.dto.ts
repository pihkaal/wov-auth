import { IsString } from "class-validator";

export class GenerateVerificationCodeDto {
  @IsString()
  wovId: string;
}
