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
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  async like(
    @CurrentUser() currentUserId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.likesService.like(currentUserId, postId);
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  async unlike(
    @CurrentUser() currentUserId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.likesService.unlike(currentUserId, postId);
  }

  @Get('post/:postId')
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
  async isLiked(
    @CurrentUser() currentUserId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    const isLiked = await this.likesService.isLiked(currentUserId, postId);
    return { isLiked };
  }

  @Get('count/:postId')
  async getLikeCount(@Param('postId', ParseIntPipe) postId: number) {
    const count = await this.likesService.getLikeCount(postId);
    return { count };
  }
}
