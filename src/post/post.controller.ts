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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new post',
    description:
      'Create a new post with text content. Maximum 1020 characters.',
  })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    schema: {
      example: {
        id: 1,
        text: 'This is my first post!',
        edited: false,
        viewed_times: 0,
        created_at: '2024-01-25T10:00:00.000Z',
        updated_at: '2024-01-25T10:00:00.000Z',
        user: {
          id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['text should not be empty', 'text must be a string'],
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
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() userId: number,
  ) {
    return this.postService.create(createPostDto, userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all posts or posts by user',
    description:
      'Get a paginated list of posts (20 per page). Can filter by userId to get posts from a specific user. Posts are ordered by creation date (newest first). Each post view increments the viewed_times counter.',
  })
  @ApiQuery({
    name: 'userId',
    description: 'Filter posts by user ID (optional)',
    required: false,
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
    description: 'Posts retrieved successfully',
    schema: {
      example: {
        posts: [
          {
            id: 2,
            text: 'My second post',
            edited: false,
            viewed_times: 5,
            created_at: '2024-01-25T11:00:00.000Z',
            updated_at: '2024-01-25T11:00:00.000Z',
            user: {
              id: 1,
              username: 'john_doe123',
            },
          },
          {
            id: 1,
            text: 'This is my first post!',
            edited: true,
            viewed_times: 15,
            created_at: '2024-01-25T10:00:00.000Z',
            updated_at: '2024-01-25T10:30:00.000Z',
            user: {
              id: 1,
              username: 'john_doe123',
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
    description: 'Bad Request - Invalid query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'userId/page must be a valid integer',
        error: 'Bad Request',
      },
    },
  })
  async findAll(
    @Query('userId') userId?: string,
    @Query('page') page?: string,
  ) {
    if (userId && !/^\d+$/.test(userId)) {
      throw new BadRequestException('userId must be a valid integer');
    }
    if (page && !/^\d+$/.test(page)) {
      throw new BadRequestException('page must be a valid integer');
    }
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    const parsedPage = page ? parseInt(page, 10) : 1;
    return this.postService.findAll({
      userId: parsedUserId,
      page: parsedPage,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a single post by ID',
    description:
      'Get detailed information about a specific post. This endpoint increments the viewed_times counter by 1 each time it is called.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully (viewed_times incremented)',
    schema: {
      example: {
        id: 1,
        text: 'This is my first post!',
        edited: false,
        viewed_times: 16,
        created_at: '2024-01-25T10:00:00.000Z',
        updated_at: '2024-01-25T10:00:00.000Z',
        user: {
          id: 1,
          username: 'john_doe123',
        },
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a post',
    description:
      'Update the text content of a post. Only the post owner can update it. The edited field will be set to true after update.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    schema: {
      example: {
        id: 1,
        text: 'This is my updated post!',
        edited: true,
        viewed_times: 16,
        created_at: '2024-01-25T10:00:00.000Z',
        updated_at: '2024-01-25T14:30:00.000Z',
        user: {
          id: 1,
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
    description: 'Forbidden - User does not own this post',
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only update your own posts',
        error: 'Forbidden',
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() userId: number,
  ) {
    return this.postService.update(id, updatePostDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a post',
    description:
      'Delete a post permanently. Only the post owner can delete it. All related comments and likes will be deleted due to cascade delete.',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
    schema: {
      example: {
        message: 'Post deleted successfully',
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
    description: 'Forbidden - User does not own this post',
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only delete your own posts',
        error: 'Forbidden',
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
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.postService.remove(id, userId);
  }
}
