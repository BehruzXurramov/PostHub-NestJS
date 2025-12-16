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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Get('activate')
  async activate(@Query('token') token: string) {
    return this.authService.activate(token);
  }

  @Post('login')
  async logIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logIn(loginDto, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logOut(
    @CurrentUser() userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logOut(userId, res);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(res, req);
  }

  @Patch('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @CurrentUser() userId: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(userId, updatePasswordDto);
  }

  @Patch('update-email')
  @UseGuards(JwtAuthGuard)
  async updateEmail(
    @CurrentUser() userId: number,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    return this.authService.updateEmail(userId, updateEmailDto);
  }

  @Get('update-email')
  async verifyNewEmail(@Query('token') token: string) {
    return this.authService.verifyNewEmail(token);
  }
}
