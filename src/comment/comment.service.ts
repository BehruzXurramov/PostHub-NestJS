import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { errorHandler } from '../utils/error_handler';
import { User } from '../users/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { PostService } from '../post/post.service';

interface GetCommentsPayload {
  postId: number;
  page?: number;
}

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private PostService: PostService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: number,
    postId: number,
  ) {
    try {
      const post = await this.PostService.findOne(postId);

      const comment = this.commentRepo.create({
        text: createCommentDto.text,
        user: { id: userId } as User,
        post: { id: postId } as Post,
      });

      const savedComment = await this.commentRepo.save(comment);
      return { ...savedComment, user: { id: userId }, post: { id: postId } };
    } catch (error) {
      errorHandler(error, 'CommentService.create');
    }
  }

  async findOne(id: number) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { id },
        relations: ['user'],
        select: {
          id: true,
          text: true,
          edited: true,
          created_at: true,
          updated_at: true,
          user: { id: true, username: true },
          post: { id: true },
        },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return comment;
    } catch (error) {
      errorHandler(error, 'CommentService.findOne');
    }
  }

  async findAll(payload: GetCommentsPayload) {
    try {
      const { postId, page = 1 } = payload;
      const take = 20;
      const skip = (page - 1) * take;

      const [comments, total] = await this.commentRepo.findAndCount({
        where: { post: { id: postId } },
        relations: ['user'],
        select: {
          id: true,
          text: true,
          edited: true,
          created_at: true,
          updated_at: true,
          user: { id: true, username: true },
        },
        order: { created_at: 'DESC' },
        skip,
        take,
      });

      return {
        comments,
        total,
        page: Math.max(1, page),
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      errorHandler(error, 'CommentService.findAll');
    }
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment.user.id !== userId) {
        throw new ForbiddenException('You can only update your own comments');
      }

      if (updateCommentDto.text) {
        comment.text = updateCommentDto.text;
        comment.edited = true;
      }

      await this.commentRepo.save(comment);
      return { ...comment, user: { id: userId } };
    } catch (error) {
      errorHandler(error, 'CommentService.update');
    }
  }

  async remove(id: number, userId: number) {
    try {
      const comment = await this.commentRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment.user.id !== userId) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      await this.commentRepo.remove(comment);
      return { message: 'Comment deleted successfully' };
    } catch (error) {
      errorHandler(error, 'CommentService.remove');
    }
  }
}
