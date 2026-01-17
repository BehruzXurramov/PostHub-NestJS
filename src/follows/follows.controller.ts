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
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Follow a user',
    description:
      'Start following another user. Users cannot follow themselves, and cannot follow the same user twice.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to follow',
    example: 2,
  })
  @ApiResponse({
    status: 201,
    description: 'User followed successfully',
    schema: {
      example: {
        message: 'Successfully followed user',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot follow yourself',
    schema: {
      example: {
        statusCode: 400,
        message: 'You cannot follow yourself',
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
    description: 'User to follow not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Already following this user',
    schema: {
      example: {
        statusCode: 409,
        message: 'You are already following this user',
        error: 'Conflict',
      },
    },
  })
  async follow(
    @CurrentUser() currentUserId: number,
    @Param('id', ParseIntPipe) userIdToFollow: number,
  ) {
    return this.followsService.follow(currentUserId, userIdToFollow);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unfollow a user',
    description:
      'Stop following a user. Can only unfollow users that are currently being followed.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to unfollow',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'User unfollowed successfully',
    schema: {
      example: {
        message: 'Successfully unfollowed user',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid operation',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid operation',
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
    description: 'Follow relationship not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Follow relationship not found',
        error: 'Not Found',
      },
    },
  })
  async unfollow(
    @CurrentUser() currentUserId: number,
    @Param('id', ParseIntPipe) userIdToUnfollow: number,
  ) {
    return this.followsService.unfollow(currentUserId, userIdToUnfollow);
  }

  @Get('followers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get followers of a user',
    description:
      'Get a paginated list of users (20 per page) who are following a specific user. Results are ordered by follow date (newest first).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to get followers for',
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
    description: 'Followers retrieved successfully',
    schema: {
      example: {
        followers: [
          {
            id: 2,
            name: 'Alice Wonder',
            username: 'alice_wonder',
            description: 'Designer and artist',
            followed_at: '2024-01-25T10:00:00.000Z',
          },
          {
            id: 3,
            name: 'Bob Builder',
            username: 'bob_builder',
            description: null,
            followed_at: '2024-01-24T15:30:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or missing userId',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'page must be a valid integer',
        error: 'Bad Request',
      },
    },
  })
  async getFollowers(
    @Param('id', ParseIntPipe) userId: number,
    @Query('page') page?: string,
  ) {
    if (page && !/^\d+$/.test(page)) {
      throw new BadRequestException('page must be a valid integer');
    }
    const parsedPage = page ? parseInt(page, 10) : 1;
    return this.followsService.getFollowers({
      userId,
      page: parsedPage,
    });
  }

  @Get('following/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get users that a user is following',
    description:
      'Get a paginated list of users (20 per page) that a specific user is following. Results are ordered by follow date (newest first).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to get following list for',
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
    description: 'Following list retrieved successfully',
    schema: {
      example: {
        following: [
          {
            id: 4,
            name: 'Carol King',
            username: 'carol_king',
            description: 'Photographer',
            followed_at: '2024-01-25T12:00:00.000Z',
          },
          {
            id: 5,
            name: 'Dave Wilson',
            username: 'dave_w',
            description: 'Tech enthusiast',
            followed_at: '2024-01-23T09:00:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or missing userId',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'page must be a valid integer',
        error: 'Bad Request',
      },
    },
  })
  async getFollowing(
    @Param('id', ParseIntPipe) userId: number,
    @Query('page') page?: string,
  ) {
    if (page && !/^\d+$/.test(page)) {
      throw new BadRequestException('page must be a valid integer');
    }
    const parsedPage = page ? parseInt(page, 10) : 1;
    return this.followsService.getFollowing({
      userId,
      page: parsedPage,
    });
  }

  @Get('status/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if current user is following another user',
    description:
      'Check whether the currently authenticated user is following a specific user.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to check',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description:
      'Follow status retrieved (true if following, false if not following or checking own profile)',
    schema: {
      example: {
        isFollowing: true,
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
  async isFollowing(
    @CurrentUser() currentUserId: number,
    @Param('id', ParseIntPipe) targetUserId: number,
  ) {
    const isFollowing = await this.followsService.isFollowing(
      currentUserId,
      targetUserId,
    );
    return { isFollowing };
  }

  @Get('counts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get follower and following counts for a user',
    description:
      'Get the total number of followers and following for a specific user.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Follow counts retrieved successfully',
    schema: {
      example: {
        followers: 150,
        following: 75,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async getFollowCounts(@Param('id', ParseIntPipe) userId: number) {
    return this.followsService.getFollowCounts(userId);
  }
}
