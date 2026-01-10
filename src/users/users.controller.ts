import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Res,
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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { Response } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search for users',
    description:
      'Search for active users by username or name. Returns paginated results (20 users per page). Only returns users who have activated their accounts.',
  })
  @ApiQuery({
    name: 'search',
    description: 'Search term (searches in both username and name fields)',
    required: true,
    example: 'john',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number (default: 1)',
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Users found successfully',
    schema: {
      example: {
        users: [
          {
            id: 1,
            name: 'John Doe',
            username: 'john_doe123',
            description: 'Software developer',
            created_at: '2024-01-15T10:30:00.000Z',
          },
          {
            id: 2,
            name: 'Johnny Smith',
            username: 'johnny_s',
            description: null,
            created_at: '2024-01-16T14:20:00.000Z',
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
    description: 'Bad Request - Search field is required',
    schema: {
      example: {
        statusCode: 400,
        message: 'Search field is required',
        error: 'Bad Request',
      },
    },
  })
  async findUsers(
    @Query('search') search: string,
    @Query('page') page?: string,
  ) {
    return this.usersService.findUsers({
      search,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Get the profile information of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        username: 'john_doe123',
        description: 'Software developer and coffee enthusiast',
        email: 'john.doe@example.com',
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-20T15:45:00.000Z',
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
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async getCurrentUser(@CurrentUser() userId: number) {
    return this.usersService.getOne({ id: userId });
  }

  @Get('available')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check username or email availability',
    description:
      'Check if a username and/or email is available for registration. Useful for real-time validation during signup.',
  })
  @ApiQuery({
    name: 'username',
    description: 'Username to check availability',
    required: false,
    example: 'john_doe123',
  })
  @ApiQuery({
    name: 'email',
    description: 'Email to check availability',
    required: false,
    example: 'john.doe@example.com',
  })
  @ApiResponse({
    status: 200,
    description:
      'Availability check completed (returns availability status for requested fields)',
    schema: {
      example: {
        usernameAvailable: true,
        emailAvailable: false,
      },
    },
  })
  async checkAvailability(
    @Query('username') username?: string,
    @Query('email') email?: string,
  ) {
    return this.usersService.isAvailable(username, email);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Get public profile information of a user by their ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        username: 'john_doe123',
        description: 'Software developer',
        email: 'john.doe@example.com',
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-20T15:45:00.000Z',
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
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getOne({ id });
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Update the profile information of the currently authenticated user. Can update name, username, and/or description. Email and password must be updated through separate endpoints.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    schema: {
      example: {
        id: 1,
        name: 'Jane Doe',
        username: 'jane_doe456',
        description: 'Updated bio',
        email: 'john.doe@example.com',
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-25T09:15:00.000Z',
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
    status: 409,
    description: 'Conflict - Username already taken',
    schema: {
      example: {
        statusCode: 409,
        message: 'Username already taken',
        error: 'Conflict',
      },
    },
  })
  async updateCurrentUser(
    @CurrentUser() userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete current user account',
    description:
      'Permanently delete the currently authenticated user account. This action cannot be undone. All related data (posts, comments, likes, follows) will be deleted due to cascade delete.',
  })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
    schema: {
      example: {
        message: 'Deleted successfully',
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
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async deleteCurrentUser(
    @CurrentUser() userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.usersService.remove(userId);
    res.clearCookie('refreshToken');
    return result;
  }
}
