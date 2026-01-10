import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
  Req,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new user account. An activation email will be sent to the provided email address. The account must be activated within 24 hours, or it will be automatically deleted.',
  })
  @ApiResponse({
    status: 201,
    description:
      'User registered successfully. Check email for activation link.',
    schema: {
      example: {
        message: 'Check your email to activate...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Passwords do not match or invalid input',
    schema: {
      example: {
        statusCode: 400,
        message: 'Passwords do not match',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Username or email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Username already exists',
        error: 'Conflict',
      },
    },
  })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Get('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate user account (Email verification link)',
    description:
      '⚠️ This endpoint is NOT for frontend applications. It is accessed by users clicking the activation link in their email. After signup, users receive an email with a link containing the activation token. This link expires in 24 hours.',
    deprecated: false,
  })
  @ApiQuery({
    name: 'token',
    description: 'JWT activation token (automatically included in email link)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Account activated successfully',
    schema: {
      example: 'Account activated successfully',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account already activated',
    schema: {
      example: 'Account is already activated',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired activation link',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired activation link',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: 'User not found',
    },
  })
  async activate(@Query('token') token: string) {
    return this.authService.activate(token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login to account',
    description:
      'Authenticate user with username/email and password. Returns an access token and sets a refresh token cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Account not activated',
    schema: {
      example: {
        statusCode: 401,
        message: 'Account not activated. Please check your email.',
        error: 'Unauthorized',
      },
    },
  })
  async logIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logIn(loginDto, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout from account',
    description:
      'Logout the current user. Invalidates the refresh token and clears the refresh token cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing access token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired access token',
        error: 'Unauthorized',
      },
    },
  })
  async logOut(
    @CurrentUser() userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logOut(userId, res);
  }

  @Post('refresh')
  @ApiCookieAuth('refreshToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generate a new access token using the refresh token from cookies. Also generates and sets a new refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Refresh token not found',
    schema: {
      example: {
        statusCode: 401,
        message: 'Refresh token not found',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired refresh token',
        error: 'Unauthorized',
      },
    },
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(res, req);
  }

  @Patch('update-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user password',
    description:
      'Change the password for the authenticated user. Requires current password for verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Password updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Passwords do not match',
    schema: {
      example: {
        statusCode: 400,
        message: 'Passwords do not match',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid current password',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Access token not found',
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
  async updatePassword(
    @CurrentUser() userId: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(userId, updatePasswordDto);
  }

  @Patch('update-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request email update',
    description:
      'Request to change user email address. A verification email will be sent to the new email address. The verification link expires in 1 hour.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent to new address',
    schema: {
      example: {
        message: 'Please check your new email to update',
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
    description: 'Conflict - Email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    },
  })
  async updateEmail(
    @CurrentUser() userId: number,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    return this.authService.updateEmail(userId, updateEmailDto);
  }

  @Get('update-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify new email address (Email verification link)',
    description:
      '⚠️ This endpoint is NOT for frontend applications. It is accessed by users clicking the verification link sent to their new email address. After requesting an email update via PATCH /auth/update-email, users receive an email with a link containing the verification token. This link expires in 1 hour.',
    deprecated: false,
  })
  @ApiQuery({
    name: 'token',
    description:
      'JWT email update token (automatically included in email link)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Email updated successfully',
    schema: {
      example: 'Email updated successfully',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired refresh token',
        error: 'Unauthorized',
      },
    },
  })
  async verifyNewEmail(@Query('token') token: string) {
    return this.authService.verifyNewEmail(token);
  }
}
