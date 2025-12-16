import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateEmailDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(255)
  new_email: string;
}
