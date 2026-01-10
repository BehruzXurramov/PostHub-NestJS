import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password', 'confirm_password'] as const),
) {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'Jane Doe',
    minLength: 2,
    maxLength: 50,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Unique username',
    example: 'jane_doe456',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'User bio or description',
    example: 'Designer and nature lover',
    maxLength: 255,
  })
  description?: string;
}
