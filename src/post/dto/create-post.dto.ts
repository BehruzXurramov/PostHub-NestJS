import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post text content',
    example: 'This is my first post!',
    maxLength: 1020,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1020)
  text: string;
}
