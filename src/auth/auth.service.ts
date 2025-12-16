import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { errorHandler } from '../utils/error_handler';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    await this.userService.create(createUserDto);

    return { message: 'Check your email to activate...' };
  }

  async logIn(logInDto: LoginDto, res: Response) {
    try {
      const { identifier, password } = logInDto;

      const user = await this.userService.getUserForAuth(identifier);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.is_active) {
        throw new UnauthorizedException(
          'Account not activated. Please check your email.',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.hashed_password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { accessToken, refreshToken } = this.jwtService.generateTokens({
        userId: user.id,
      });

      await this.userService.updateRefreshToken(user.id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { accessToken };
    } catch (error) {
      errorHandler(error, 'AuthService.logIn');
    }
  }

  async logOut(userId: number, res: Response) {
    try {
      await this.userService.updateRefreshToken(userId, null);

      res.clearCookie('refreshToken');

      return { message: 'Logged out successfully' };
    } catch (error) {
      errorHandler(error, 'AuthService.logOut');
    }
  }

  async refresh(res: Response, req: Request) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const { userId } = await this.jwtService.verifyRefreshToken(refreshToken);

      const user = await this.userService.getOneForAuthById(userId);

      if (!user || !user.hashed_refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isTokenValid = await bcrypt.compare(
        refreshToken,
        user.hashed_refresh_token,
      );

      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = this.jwtService.generateTokens({ userId });

      res.cookie('refreshToken', payload.refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await this.userService.updateRefreshToken(userId, payload.refreshToken);

      return { accessToken: payload.accessToken };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      errorHandler(error, 'AuthService.refresh');
    }
  }

  async updatePassword(userId: number, updatePassword: UpdatePasswordDto) {
    try {
      if (updatePassword.new_password !== updatePassword.confirm_new_password) {
        throw new BadRequestException('Passwords do not match');
      }

      const user = await this.userService.getOneForAuthById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        updatePassword.current_password,
        user.hashed_password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      await this.userService.updatePassword(
        user.id,
        updatePassword.new_password,
      );

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      errorHandler(error, 'AuthService.updatePassword');
    }
  }

  async updateEmail(userId: number, { new_email }: UpdateEmailDto) {
    try {
      const { emailAvailable } = await this.userService.isAvailable(
        undefined,
        new_email,
      );

      if (!emailAvailable) {
        throw new ConflictException('Email already exists');
      }

      const user = await this.userService.getOneForAuthById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updateToken = this.jwtService.generateUpdateToken({
        userId,
        new_email,
      });

      this.emailService.sendEmailUpdateVerification(
        new_email,
        user.username,
        updateToken,
      );

      return { message: 'Please check your new email to update' };
    } catch (error) {
      errorHandler(error, 'AuthService.updateEmail');
    }
  }

  async activate(token: string) {
    try {
      const { userId } = await this.jwtService.verifyActivationToken(token);

      const user = await this.userService.getOne({ id: userId });
      if (!user) {
        return 'User not found';
      }

      if (user.is_active) {
        return 'Account is already activated';
      }

      await this.userService.activateUser(userId);

      return 'Account activated successfully';
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new BadRequestException('Invalid or expired activation link');
      }

      errorHandler(error, 'AuthService.activate');
    }
  }

  async verifyNewEmail(token: string) {
    try {
      const { userId, new_email } =
        await this.jwtService.verifyUpdateToken(token);

      await this.userService.updateEmail(userId, new_email);

      return 'Email updated successfully';
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      errorHandler(error, 'AuthService.verifyNewEmail');
    }
  }
}
