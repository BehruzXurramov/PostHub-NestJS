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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
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
  async getCurrentUser(@CurrentUser() userId: number) {
    return this.usersService.getOne({ id: userId });
  }

  @Get('available')
  async checkAvailability(
    @Query('username') username?: string,
    @Query('email') email?: string,
  ) {
    return this.usersService.isAvailable(username, email);
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getOne({ id });
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateCurrentUser(
    @CurrentUser() userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteCurrentUser(
    @CurrentUser() userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.usersService.remove(userId);

    res.clearCookie('refreshToken');

    return result;
  }
}
