import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { MoreThan, Repository } from 'typeorm';
import { EmailService } from '../../common/services/email.service';
import { UsersService } from '../users/users.service';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RevokedToken } from './entities/revoked-token.entity';
import { VerificationToken } from './entities/verification-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @InjectRepository(RevokedToken)
    private revokedTokenRepository: Repository<RevokedToken>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(VerificationToken)
    private verificationTokenRepository: Repository<VerificationToken>,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate and send verification token
    await this.sendVerificationEmail(user.id, user.email, user.name);

    // Don't return tokens until user is verified
    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is verified
    if (!user.verified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    // Check if token is revoked
    const isRevoked = await this.isTokenRevoked(refreshToken);
    if (isRevoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke the old refresh token
    await this.revokeToken(userId, refreshToken);

    const tokens = await this.generateTokens(user.id);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    // Clear refresh token from user
    await this.usersService.updateRefreshToken(userId, '');

    // Revoke the refresh token if provided
    if (refreshToken) {
      await this.revokeToken(userId, refreshToken);
    }

    // Clean up expired revoked tokens
    await this.cleanupExpiredTokens();

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    const secret = this.configService.get<string>('jwt.secret');
    const accessTokenExpiration =
      this.configService.get<string>('jwt.accessTokenExpiration') || '15m';
    const refreshTokenExpiration =
      this.configService.get<string>('jwt.refreshTokenExpiration') || '7d';

    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: accessTokenExpiration,
      } as any),
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: refreshTokenExpiration,
      } as any),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashedToken);
  }

  private async revokeToken(userId: string, token: string): Promise<void> {
    // Decode token to get expiration
    const decoded = this.jwtService.decode(token) as any;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

    // Hash the token before storing
    const hashedToken = await bcrypt.hash(token, 10);

    const revokedToken = this.revokedTokenRepository.create({
      userId,
      token: hashedToken,
      expiresAt,
    });

    await this.revokedTokenRepository.save(revokedToken);
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

  private async cleanupExpiredTokens(): Promise<void> {
    // Delete expired revoked tokens (where expiresAt is less than current date)
    const result = await this.revokedTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const user = await this.usersService.findByEmail(forgetPasswordDto.email);

    // Don't reveal if user exists for security
    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const plainToken = this.generateRandomToken();
    const hashedToken = await bcrypt.hash(plainToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token (hashed)
    const resetToken = this.passwordResetTokenRepository.create({
      userId: user.id,
      token: hashedToken,
      expiresAt,
      used: false,
    });
    await this.passwordResetTokenRepository.save(resetToken);

    // Send email with plain token
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      plainToken,
    );

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Find valid reset token
    const resetTokens = await this.passwordResetTokenRepository.find({
      where: {
        expiresAt: MoreThan(new Date()),
        used: false,
      },
      relations: ['user'],
    });

    let validToken: PasswordResetToken | null = null;
    for (const token of resetTokens) {
      const isMatch = await bcrypt.compare(resetPasswordDto.token, token.token);
      if (isMatch) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.usersService.updatePassword(validToken.userId, hashedPassword);

    // Mark token as used
    validToken.used = true;
    await this.passwordResetTokenRepository.save(validToken);

    // Revoke all refresh tokens for security
    await this.usersService.updateRefreshToken(validToken.userId, '');

    return {
      message: 'Password has been reset successfully',
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    // Find valid verification token
    const verificationTokens = await this.verificationTokenRepository.find({
      where: {
        expiresAt: MoreThan(new Date()),
        used: false,
      },
      relations: ['user'],
    });

    let validToken: VerificationToken | null = null;
    for (const token of verificationTokens) {
      const isMatch = await bcrypt.compare(verifyEmailDto.token, token.token);
      if (isMatch) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Verify user
    await this.usersService.verifyUser(validToken.userId);

    // Mark token as used
    validToken.used = true;
    await this.verificationTokenRepository.save(validToken);

    return {
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return {
        message:
          'If an account with that email exists, a verification email has been sent.',
      };
    }

    if (user.verified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendVerificationEmail(user.id, user.email, user.name);

    return {
      message:
        'If an account with that email exists, a verification email has been sent.',
    };
  }

  private async sendVerificationEmail(
    userId: string,
    email: string,
    name: string,
  ) {
    // Generate verification token
    const plainToken = this.generateRandomToken();
    const hashedToken = await bcrypt.hash(plainToken, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save verification token (hashed)
    const verificationToken = this.verificationTokenRepository.create({
      userId,
      token: hashedToken,
      expiresAt,
      used: false,
    });
    await this.verificationTokenRepository.save(verificationToken);

    // Send email with plain token
    await this.emailService.sendVerificationEmail(email, name, plainToken);
  }

  private generateRandomToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
}
