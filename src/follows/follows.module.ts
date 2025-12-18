import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow]), UsersModule, JwtModule],
  controllers: [FollowsController],
  providers: [FollowsService],
})
export class FollowsModule {}
