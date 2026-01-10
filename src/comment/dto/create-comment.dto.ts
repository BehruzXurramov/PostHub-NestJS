import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment text content',
    example: 'Great post!',
    maxLength: 1020,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1020)
  text: string;
}
