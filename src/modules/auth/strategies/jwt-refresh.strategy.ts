import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { RevokedToken } from '../entities/revoked-token.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @InjectRepository(RevokedToken)
    private revokedTokenRepository: Repository<RevokedToken>,
  ) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    } as any);
  }

  async validate(req: any, payload: any) {
    const refreshToken = req.body.refreshToken;

    // Check if token is revoked
    const isRevoked = await this.isTokenRevoked(refreshToken);
    if (isRevoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.usersService.findOne(payload.sub);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }

  private async isTokenRevoked(token: string): Promise<boolean> {
    // Get all active (non-expired) revoked tokens
    const revokedTokens = await this.revokedTokenRepository.find({
      where: {
        expiresAt: MoreThan(new Date()),
      },
    });

    // Check if token matches any revoked token
    for (const revokedToken of revokedTokens) {
      try {
        const isMatch = await bcrypt.compare(token, revokedToken.token);
        if (isMatch) {
          return true;
        }
      } catch (error) {
        // Continue checking other tokens if comparison fails
        continue;
      }
    }

    return false;
  }
}
