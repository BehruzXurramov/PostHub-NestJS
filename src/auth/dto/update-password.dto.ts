import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'OldPassword123',
    minLength: 4,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  current_password: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPassword456',
    minLength: 4,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  new_password: string;

  @ApiProperty({
    description: 'New password confirmation (must match new_password)',
    example: 'NewPassword456',
    minLength: 4,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  confirm_new_password: string;
}
