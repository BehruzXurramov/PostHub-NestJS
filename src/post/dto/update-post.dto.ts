import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({
    description: 'Updated post text content',
    example: 'This is my updated post!',
    maxLength: 1020,
  })
  text?: string;
}
