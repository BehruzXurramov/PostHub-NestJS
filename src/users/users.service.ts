import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { logError } from '../utils/error_logger';
import bcrypt from 'bcrypt';
import { JwtService } from '../jwt/jwt.service';
import { EmailService } from '../email/email.service';
import { errorHandler } from '../utils/error_handler';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EntityNotFoundError,
  FindOptionsWhere,
  ILike,
  LessThan,
  Repository,
  Brackets,
} from 'typeorm';

interface GetOnePayload {
  id?: number;
  email?: string;
  username?: string;
}

interface FindUsersPayload {
  search?: string;
  page?: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    let savedUser: User | undefined;

    try {
      if (createUserDto.password !== createUserDto.confirm_password) {
        throw new BadRequestException('Passwords do not match');
      }

      const { emailAvailable, usernameAvailable } = await this.isAvailable(
        createUserDto.username,
        createUserDto.email,
      );

      if (!usernameAvailable && !emailAvailable) {
        throw new ConflictException('Username and email already exist');
      }
      if (!usernameAvailable) {
        throw new ConflictException('Username already exists');
      }
      if (!emailAvailable) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.userRepo.create({
        name: createUserDto.name,
        username: createUserDto.username,
        description: createUserDto.description || null,
        email: createUserDto.email.toLowerCase(),
        hashed_password: hashedPassword,
        is_active: false, 
      });

      savedUser = await this.userRepo.save(user);

      const activationToken = this.jwtService.generateActivationToken({
        userId: savedUser.id,
      });

      await this.emailService.sendActivationEmail(
        savedUser.email,
        savedUser.username,
        activationToken,
      );

      const { hashed_password, hashed_refresh_token, ...sanitizedUser } =
        savedUser;

      return sanitizedUser as User;
    } catch (error) {
      if (savedUser) {
        try {
          await this.userRepo.remove(savedUser);
        } catch (cleanupError) {
          logError(cleanupError, 'UsersService.create - cleanup failed');
        }
      }

      errorHandler(error, 'UserService.create');
    }
  }

  async getOne(payload: GetOnePayload): Promise<User> {
    try {
      const { id, email, username } = payload;

      if ([id, email, username].filter(Boolean).length !== 1) {
        throw new BadRequestException(
          'Exactly one of id, email, or username must be provided',
        );
      }

      const where: FindOptionsWhere<User> = {};

      if (id) {
        where.id = id;
      } else if (email) {
        where.email = email.toLocaleLowerCase();
      } else if (username) {
        where.username = ILike(username);
      }

      const user = await this.userRepo.findOneOrFail({
        select: [
          'id',
          'name',
          'username',
          'description',
          'email',
          'is_active',
          'created_at',
          'updated_at',
        ],
        where,
      });

      return user;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('User not found');
      }
      errorHandler(error, 'UserService.getOne');
    }
  }

  async findUsers(payload: FindUsersPayload): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { search, page = 1 } = payload;

      const take = 20;
      const skip = (Math.max(1, page) - 1) * take;

      if (!search) {
        throw new BadRequestException('Search field is required');
      }

      const queryBuilder = this.userRepo
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.name',
          'user.username',
          'user.description',
          'user.created_at',
        ])
        .where('user.is_active = :isActive', { isActive: true })
        .orderBy('user.created_at', 'DESC');

      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.username) LIKE LOWER(:search)', {
            search: `%${search}%`,
          }).orWhere('LOWER(user.name) LIKE LOWER(:search)', {
            search: `%${search}%`,
          });
        }),
        { search: `%${search}%` },
      );

      const [users, total] = await queryBuilder
        .skip(skip)
        .take(take)
        .getManyAndCount();

      return {
        users,
        total,
        page: Math.max(1, page),
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      errorHandler(error, 'UserService.findUsers');
    }
  }

  async getUserForAuth(identifier: string): Promise<User | null> {
    try {
      const user = await this.userRepo.findOne({
        where: [
          { email: identifier.toLowerCase() },
          { username: ILike(identifier) },
        ],
      });

      return user;
    } catch (error) {
      errorHandler(error, 'UserService.getUserForAuth');
    }
  }

  async getOneForAuthById(id: number) {
    try {
      return await this.userRepo.findOneBy({ id });
    } catch (error) {
      errorHandler(error, 'UserService.getOneForAuthById');
    }
  }

  async activateUser(userId: number) {
    await this.userRepo.update({ id: userId }, { is_active: true });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.username) {
        const { usernameAvailable } = await this.isAvailable(
          updateUserDto.username,
          undefined,
          id,
        );
        if (!usernameAvailable) {
          throw new ConflictException('Username already taken');
        }
      }

      const updateRes = await this.userRepo.update({ id }, updateUserDto);

      if (updateRes.affected === 0) {
        throw new NotFoundException('User not found');
      }

      return this.getOne({ id });
    } catch (error) {
      errorHandler(error, 'UserService.update');
    }
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    try {
      const hashedRefreshToken = refreshToken
        ? await bcrypt.hash(refreshToken, 10)
        : null;

      await this.userRepo.update(
        { id: userId },
        { hashed_refresh_token: hashedRefreshToken },
      );
    } catch (error) {
      errorHandler(error, 'UserService.updateRefreshToken');
    }
  }

  async remove(id: number) {
    try {
      const deleteRes = await this.userRepo.delete({ id });

      if (deleteRes.affected === 0) {
        throw new NotFoundException('User not found');
      }

      

      return { message: 'Deleted successfully' };
    } catch (error) {
      errorHandler(error, 'UserService.remove');
    }
  }

  async isAvailable(username?: string, email?: string, excludeUserId?: number) {
    try {
      const res = {
        usernameAvailable: true,
        emailAvailable: true,
      };

      if (username) {
        res.usernameAvailable = !(await this.userRepo
          .createQueryBuilder('user')
          .where('LOWER(user.username) = LOWER(:username)', { username })
          .andWhere(excludeUserId ? 'user.id != :excludeUserId' : '1=1', {
            excludeUserId,
          })
          .getExists());
      }

      if (email) {
        res.emailAvailable = !(await this.userRepo
          .createQueryBuilder('user')
          .where('LOWER(user.email) = LOWER(:email)', { email })
          .andWhere(excludeUserId ? 'user.id != :excludeUserId' : '1=1', {
            excludeUserId,
          })
          .getExists());
      }

      return res;
    } catch (error) {
      errorHandler(error, 'UserSerive.isAvailable');
    }
  }

  async deleteUnactivatedUsers() {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const result = await this.userRepo.delete({
        is_active: false,
        created_at: LessThan(twentyFourHoursAgo),
      });

      return result.affected || 0;
    } catch (error) {
      errorHandler(error, 'UserService.deleteUnactivateUsers');
    }
  }
}
