import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

export interface TokenPayload {
  userId: number;
}

export interface ActivationPayload {
  userId: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface EmailUpdatePayload {
  userId: number;
  new_email: string;
}

@Injectable()
export class JwtService {
  constructor(
    private nestJwtService: NestJwtService,
    private configService: ConfigService,
  ) {}

  generateTokens(payload: TokenPayload): TokenPair {
    const accessToken = this.nestJwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
    });

    const refreshToken = this.nestJwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });

    return { accessToken, refreshToken };
  }

  generateActivationToken(payload: ActivationPayload): string {
    const activationToken = this.nestJwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACTIVATION_SECRET'),
      expiresIn: this.configService.get('JWT_ACTIVATION_EXPIRATION'),
    });

    return activationToken;
  }

  generateUpdateToken(payload: EmailUpdatePayload) {
    const updateToken = this.nestJwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_UPDATE_SECRET'),
      expiresIn: this.configService.get('JWT_UPDATE_EXPIRATION'),
    });

    return updateToken;
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async verifyActivationToken(token: string): Promise<ActivationPayload> {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACTIVATION_SECRET'),
    });
  }

  async verifyUpdateToken(token: string): Promise<EmailUpdatePayload> {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get<string>('JWT_UPDATE_SECRET'),
    });
  }
}
