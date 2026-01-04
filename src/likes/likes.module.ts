import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { JwtModule } from '../jwt/jwt.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), JwtModule, PostModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
