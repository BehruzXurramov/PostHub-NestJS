import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description:
      'Unique username (3-15 characters, starts with letter, can contain letters, numbers, and underscores, no consecutive underscores)',
    example: 'john_doe123',
    pattern: '^(?!.*__)[A-Za-z][A-Za-z0-9_]{1,13}[A-Za-z0-9]$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?!.*__)[A-Za-z][A-Za-z0-9_]{1,13}[A-Za-z0-9]$/, {
    message:
      'Username must be 3-15 characters, start with a letter, and can only contain letters, numbers, and underscores (no consecutive underscores)',
  })
  username: string;

  @ApiPropertyOptional({
    description: 'User bio or description',
    example: 'Software developer and coffee enthusiast',
    maxLength: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description: string | null;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'MyPassword123',
    minLength: 4,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;

  @ApiProperty({
    description: 'Password confirmation (must match password)',
    example: 'MyPassword123',
    minLength: 4,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  confirm_password: string;
}
