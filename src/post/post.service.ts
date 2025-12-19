import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { errorHandler } from '../utils/error_handler';
import { User } from '../users/entities/user.entity';

interface GetPostsPayload {
  userId?: number;
  page?: number;
}

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    try {
      const post = this.postRepo.create({
        text: createPostDto.text,
        user: { id: userId } as User,
      });

      const savedPost = await this.postRepo.save(post);
      return { ...savedPost, user: { id: userId } };
    } catch (error) {
      errorHandler(error, 'PostService.create');
    }
  }

  async findOne(id: number) {
    try {
      const post = await this.postRepo.findOne({
        where: { id },
        relations: ['user'],
        select: {
          id: true,
          text: true,
          edited: true,
          viewed_times: true,
          created_at: true,
          updated_at: true,
          user: { id: true, username: true },
        },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      post.viewed_times += 1;
      await this.postRepo.save(post);

      return post;
    } catch (error) {
      errorHandler(error, 'PostService.findOne');
    }
  }

  async findAll(payload: GetPostsPayload = {}) {
    try {
      const { userId, page = 1 } = payload;
      const take = 20;
      const skip = (Math.max(1, page) - 1) * take;

      const where: any = {};
      if (userId) {
        where.user = { id: userId };
      }

      const [posts, total] = await this.postRepo.findAndCount({
        where,
        relations: ['user'],
        select: {
          id: true,
          text: true,
          edited: true,
          viewed_times: true,
          created_at: true,
          updated_at: true,
          user: { id: true, username: true },
        },
        order: { created_at: 'DESC' },
        skip,
        take,
      });

      return {
        posts,
        total,
        page: Math.max(1, page),
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      errorHandler(error, 'PostService.findAll');
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    try {
      const post = await this.postRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.user.id !== userId) {
        throw new ForbiddenException('You can only update your own posts');
      }

      if (updatePostDto.text) {
        post.text = updatePostDto.text;
        post.edited = true;
      }

      await this.postRepo.save(post);
      return { ...post, user: { id: userId } };
    } catch (error) {
      errorHandler(error, 'PostService.update');
    }
  }

  async remove(id: number, userId: number) {
    try {
      const post = await this.postRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.user.id !== userId) {
        throw new ForbiddenException('You can only delete your own posts');
      }

      await this.postRepo.remove(post);
      return { message: 'Post deleted successfully' };
    } catch (error) {
      errorHandler(error, 'PostService.remove');
    }
  }
}
