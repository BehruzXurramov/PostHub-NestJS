import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { errorHandler } from '../utils/error_handler';
import { User } from '../users/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { PostService } from '../post/post.service';

interface GetLikesPayload {
  postId: number;
  page?: number;
}

interface GetLikedPostsPayload {
  userId: number;
  page?: number;
}

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    private postService: PostService,
  ) {}

  async like(currentUserId: number, postId: number) {
    try {
      const post = await this.postService.findOne(postId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.user.id === currentUserId) {
        throw new BadRequestException('You cannot like your own post');
      }

      const like = this.likeRepo.create({
        user: { id: currentUserId } as User,
        post: { id: postId } as Post,
      });

      await this.likeRepo.save(like);

      return { message: 'Post liked successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('You have already liked this post');
      }
      if (error.code === '23503') {
        throw new NotFoundException('User or post not found');
      }
      errorHandler(error, 'LikesService.like');
    }
  }

  async unlike(currentUserId: number, postId: number) {
    try {
      const like = await this.likeRepo.findOne({
        where: {
          user: { id: currentUserId } as User,
          post: { id: postId } as Post,
        },
      });

      if (!like) {
        throw new NotFoundException('Like not found');
      }

      await this.likeRepo.remove(like);

      return { message: 'Post unliked successfully' };
    } catch (error) {
      errorHandler(error, 'LikesService.unlike');
    }
  }

  async getLikesForPost(payload: GetLikesPayload) {
    try {
      const { postId, page = 1 } = payload;
      const take = 10;
      const skip = Math.max(0, (page - 1) * take);

      const [likes, total] = await this.likeRepo.findAndCount({
        where: { post: { id: postId } as Post },
        relations: ['user'],
        select: {
          id: true,
          created_at: true,
          user: { id: true, username: true, name: true },
        },
        order: { created_at: 'DESC' },
        skip,
        take,
      });

      return {
        likes: likes.map((like) => ({
          user: like.user,
          liked_at: like.created_at,
        })),
        total,
        page: Math.max(1, page),
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      errorHandler(error, 'LikesService.getLikesForPost');
    }
  }

  async getLikedPostsForUser(payload: GetLikedPostsPayload) {
    try {
      const { userId, page = 1 } = payload;
      const take = 10;
      const skip = Math.max(0, (page - 1) * take);

      const [likes, total] = await this.likeRepo.findAndCount({
        where: { user: { id: userId } as User },
        relations: ['post', 'post.user'],
        select: {
          id: true,
          created_at: true,
          post: {
            id: true,
            text: true,
            edited: true,
            viewed_times: true,
            created_at: true,
            updated_at: true,
            user: { id: true, username: true },
          },
        },
        order: { created_at: 'DESC' },
        skip,
        take,
      });

      return {
        posts: likes.map((like) => ({
          ...like.post,
          liked_at: like.created_at,
        })),
        total,
        page: Math.max(1, page),
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      errorHandler(error, 'LikesService.getLikedPostsForUser');
    }
  }

  async isLiked(currentUserId: number, postId: number) {
    try {
      return await this.likeRepo.exists({
        where: {
          user: { id: currentUserId } as User,
          post: { id: postId } as Post,
        },
      });
    } catch (error) {
      errorHandler(error, 'LikesService.isLiked');
    }
  }

  async getLikeCount(postId: number) {
    try {
      const post = await this.postService.findOne(postId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      return await this.likeRepo.count({
        where: { post: { id: postId } as Post },
      });
    } catch (error) {
      errorHandler(error, 'LikesService.getLikeCount');
    }
  }
}
