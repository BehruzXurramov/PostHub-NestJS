import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { errorHandler } from '../utils/error_handler';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

interface FollowPayload {
  userId: number;
  page?: number;
}

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    private userService: UsersService,
  ) {}

  async follow(currentUserId: number, userIdToFollow: number) {
    try {
      if (currentUserId === userIdToFollow) {
        throw new BadRequestException('You cannot follow yourself');
      }

      const follow = this.followRepo.create({
        follower: { id: currentUserId } as User,
        followed: { id: userIdToFollow } as User,
      });

      await this.followRepo.save(follow);

      return { message: 'Successfully followed user' };
    } catch (error) {
      if (error.code === '23503') {
        throw new NotFoundException('User not found');
      }

      if (error.code === '23505') {
        throw new ConflictException('You are already following this user');
      }

      errorHandler(error, 'FollowsService.follow');
    }
  }

  async unfollow(currentUserId: number, userIdToUnfollow: number) {
    try {
      if (currentUserId === userIdToUnfollow) {
        throw new BadRequestException('Invalid operation');
      }

      const deleteRes = await this.followRepo.delete({
        follower: { id: currentUserId } as User,
        followed: { id: userIdToUnfollow } as User,
      });

      if (deleteRes.affected === 0) {
        throw new NotFoundException('Follow relationship not found');
      }

      return { message: 'Successfully unfollowed user' };
    } catch (error) {
      errorHandler(error, 'FollowsService.unfollow');
    }
  }

  async getFollowers(payload: FollowPayload) {
    try {
      const { userId, page = 1 } = payload;

      const take = 20;
      const skip = (Math.max(1, page) - 1) * take;

      const userExists = await this.userService.existsBy(userId);
      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      const [follows, total] = await this.followRepo.findAndCount({
        where: { followed: { id: userId } as User },
        relations: ['follower'],
        select: {
          id: true,
          created_at: true,
          follower: {
            id: true,
            name: true,
            username: true,
            description: true,
          },
        },
        order: { created_at: 'DESC' },
        skip,
        take,
      });

      return {
        followers: follows.map((follow) => ({
          id: follow.follower.id,
          name: follow.follower.name,
          username: follow.follower.username,
          description: follow.follower.description,
          followed_at: follow.created_at,
        })),
        total,
        page: Math.max(1, page),
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      errorHandler(error, 'FollowsService.getFollowers');
    }
  }

  async getFollowing(payload: FollowPayload) {
    try {
      const { userId, page = 1 } = payload;

      const take = 20;
      const skip = (Math.max(1, page) - 1) * take;

      const userExists = await this.userService.existsBy(userId);
      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      const [follows, total] = await this.followRepo.findAndCount({
        where: { follower: { id: userId } as User },
        relations: ['followed'],
        select: {
          id: true,
          created_at: true,
          followed: {
            id: true,
            name: true,
            username: true,
            description: true,
          },
        },
        order: { created_at: 'DESC' },
        skip,
        take,
      });

      return {
        following: follows.map((follow) => ({
          id: follow.followed.id,
          name: follow.followed.name,
          username: follow.followed.username,
          description: follow.followed.description,
          followed_at: follow.created_at,
        })),
        total,
        page: Math.max(1, page),
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      errorHandler(error, 'FollowsService.getFollowing');
    }
  }

  async isFollowing(currentUserId: number, targetUserId: number) {
    try {
      if (currentUserId === targetUserId) {
        return false;
      }

      const follow = await this.followRepo.existsBy({
        follower: { id: currentUserId } as User,
        followed: { id: targetUserId } as User,
      });

      return follow;
    } catch (error) {
      errorHandler(error, 'FollowsService.isFollowing');
    }
  }

  async getFollowCounts(userId: number) {
    try {
      const userExists = await this.userService.existsBy(userId);
      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      const [followersCount, followingCount] = await Promise.all([
        this.followRepo.countBy({ followed: { id: userId } as User }),
        this.followRepo.countBy({ follower: { id: userId } as User }),
      ]);

      return {
        followers: followersCount,
        following: followingCount,
      };
    } catch (error) {
      errorHandler(error, 'FollowsService.getFollowCounts');
    }
  }
}
