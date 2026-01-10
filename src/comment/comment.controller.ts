import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a comment on a post',
    description:
      'Add a new comment to a specific post. The postId must be provided as a query parameter.',
  })
  @ApiQuery({
    name: 'postId',
    description: 'ID of the post to comment on',
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    schema: {
      example: {
        id: 1,
        text: 'Great post!',
        edited: false,
        created_at: '2024-01-25T15:00:00.000Z',
        updated_at: '2024-01-25T15:00:00.000Z',
        user: {
          id: 2,
        },
        post: {
          id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or missing postId',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing access token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Access token not found',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Post not found',
        error: 'Not Found',
      },
    },
  })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() userId: number,
    @Query('postId', ParseIntPipe) postId: number,
  ) {
    return this.commentService.create(createCommentDto, userId, postId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all comments for a post',
    description:
      'Get a paginated list of comments (20 per page) for a specific post. Comments are ordered by creation date (newest first).',
  })
  @ApiQuery({
    name: 'postId',
    description: 'ID of the post to get comments from',
    required: true,
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number (default: 1)',
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      example: {
        comments: [
          {
            id: 2,
            text: 'Thanks for sharing!',
            edited: false,
            created_at: '2024-01-25T16:00:00.000Z',
            updated_at: '2024-01-25T16:00:00.000Z',
            user: {
              id: 3,
              username: 'jane_smith',
            },
          },
          {
            id: 1,
            text: 'Great post!',
            edited: true,
            created_at: '2024-01-25T15:00:00.000Z',
            updated_at: '2024-01-25T15:30:00.000Z',
            user: {
              id: 2,
              username: 'alice_wonder',
            },
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or missing postId',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  async findAll(
    @Query('postId', ParseIntPipe) postId: number,
    @Query('page') page?: string,
  ) {
    return this.commentService.findAll({
      postId,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a single comment by ID',
    description: 'Get detailed information about a specific comment.',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Comment retrieved successfully',
    schema: {
      example: {
        id: 1,
        text: 'Great post!',
        edited: false,
        created_at: '2024-01-25T15:00:00.000Z',
        updated_at: '2024-01-25T15:00:00.000Z',
        user: {
          id: 2,
          username: 'alice_wonder',
        },
        post: {
          id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Comment not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a comment',
    description:
      'Update the text content of a comment. Only the comment owner can update it. The edited field will be set to true after update.',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    schema: {
      example: {
        id: 1,
        text: 'Updated comment text',
        edited: true,
        created_at: '2024-01-25T15:00:00.000Z',
        updated_at: '2024-01-25T17:00:00.000Z',
        user: {
          id: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing access token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Access token not found',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not own this comment',
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only update your own comments',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Comment not found',
        error: 'Not Found',
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() userId: number,
  ) {
    return this.commentService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a comment',
    description:
      'Delete a comment permanently. Only the comment owner can delete it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
    schema: {
      example: {
        message: 'Comment deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing access token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Access token not found',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not own this comment',
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only delete your own comments',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Comment not found',
        error: 'Not Found',
      },
    },
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.commentService.remove(id, userId);
  }
}
