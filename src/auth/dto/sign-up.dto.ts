import { IsEmail, IsString } from "class-validator";

export class SignUpDto {
  @IsString()
  wovId: string;

  @IsString()
  code: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
