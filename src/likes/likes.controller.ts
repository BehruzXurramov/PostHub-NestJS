import {
  Controller,
  Post,
  Delete,
  Get,
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
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Like a post',
    description:
      'Add a like to a specific post. A user can only like a post once.',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID of the post to like',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Post liked successfully',
    schema: {
      example: {
        message: 'Post liked successfully',
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
  @ApiResponse({
    status: 409,
    description: 'Conflict - Post already liked',
    schema: {
      example: {
        statusCode: 409,
        message: 'You have already liked this post',
        error: 'Conflict',
      },
    },
  })
  async like(
    @CurrentUser() currentUserId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.likesService.like(currentUserId, postId);
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unlike a post',
    description:
      'Remove a like from a post. Can only unlike posts that the user has previously liked.',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID of the post to unlike',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Post unliked successfully',
    schema: {
      example: {
        message: 'Post unliked successfully',
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
    description: 'Like not found - Post was not liked by this user',
    schema: {
      example: {
        statusCode: 404,
        message: 'Like not found',
        error: 'Not Found',
      },
    },
  })
  async unlike(
    @CurrentUser() currentUserId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.likesService.unlike(currentUserId, postId);
  }

  @Get('post/:postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get users who liked a post',
    description:
      'Get a paginated list of users (10 per page) who have liked a specific post. Results are ordered by like date (newest first).',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID of the post',
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
    description: 'Likes retrieved successfully',
    schema: {
      example: {
        likes: [
          {
            user: {
              id: 2,
              username: 'alice_wonder',
              name: 'Alice Wonder',
            },
            liked_at: '2024-01-25T16:00:00.000Z',
          },
          {
            user: {
              id: 3,
              username: 'bob_builder',
              name: 'Bob Builder',
            },
            liked_at: '2024-01-25T15:30:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
    },
  })
  async getLikesForPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page') page?: string,
  ) {
    return this.likesService.getLikesForPost({
      postId,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get posts liked by a user',
    description:
      'Get a paginated list of posts (10 per page) that a specific user has liked. Results are ordered by like date (newest first).',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
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
    description: 'Liked posts retrieved successfully',
    schema: {
      example: {
        posts: [
          {
            id: 5,
            text: 'Amazing sunset today!',
            edited: false,
            viewed_times: 25,
            created_at: '2024-01-25T18:00:00.000Z',
            updated_at: '2024-01-25T18:00:00.000Z',
            user: {
              id: 4,
              username: 'carol_king',
            },
            liked_at: '2024-01-25T19:00:00.000Z',
          },
          {
            id: 3,
            text: 'Check out my new project!',
            edited: false,
            viewed_times: 50,
            created_at: '2024-01-24T10:00:00.000Z',
            updated_at: '2024-01-24T10:00:00.000Z',
            user: {
              id: 2,
              username: 'alice_wonder',
            },
            liked_at: '2024-01-25T14:00:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
    },
  })
  async getLikedPostsForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
  ) {
    return this.likesService.getLikedPostsForUser({
      userId,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get('status/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if current user liked a post',
    description:
      'Check whether the currently authenticated user has liked a specific post.',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID of the post to check',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Like status retrieved (true if liked, false if not liked)',
    schema: {
      example: {
        isLiked: true,
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
  async isLiked(
    @CurrentUser() currentUserId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    const isLiked = await this.likesService.isLiked(currentUserId, postId);
    return { isLiked };
  }

  @Get('count/:postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get like count for a post',
    description: 'Get the total number of likes for a specific post.',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID of the post',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Like count retrieved successfully',
    schema: {
      example: {
        count: 15,
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
  async getLikeCount(@Param('postId', ParseIntPipe) postId: number) {
    const count = await this.likesService.getLikeCount(postId);
    return { count };
  }
}
