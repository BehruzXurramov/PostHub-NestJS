import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), JwtModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
