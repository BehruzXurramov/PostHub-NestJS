import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiPropertyOptional({
    description: 'Updated comment text content',
    example: 'Updated comment text',
    maxLength: 1020,
  })
  text?: string;
}
