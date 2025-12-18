import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  async follow(
    @CurrentUser() currentUserId: number,
    @Param('id', ParseIntPipe) userIdToFollow: number,
  ) {
    return this.followsService.follow(currentUserId, userIdToFollow);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async unfollow(
    @CurrentUser() currentUserId: number,
    @Param('id', ParseIntPipe) userIdToUnfollow: number,
  ) {
    return this.followsService.unfollow(currentUserId, userIdToUnfollow);
  }

  @Get('followers/:id')
  async getFollowers(
    @Param('id', ParseIntPipe) userId: number,
    @Query('page') page?: string,
  ) {
    return this.followsService.getFollowers({
      userId,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get('following/:id')
  async getFollowing(
    @Param('id', ParseIntPipe) userId: number,
    @Query('page') page?: string,
  ) {
    return this.followsService.getFollowing({
      userId,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get('status/:id')
  @UseGuards(JwtAuthGuard)
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
  async getFollowCounts(@Param('id', ParseIntPipe) userId: number) {
    return this.followsService.getFollowCounts(userId);
  }
}
