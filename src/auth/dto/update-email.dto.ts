import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailDto {
  @ApiProperty({
    description: 'New email address',
    example: 'newemail@example.com',
    format: 'email',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(255)
  new_email: string;
}
