import { IsEmail, IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { UserRole } from '@/common/enums/user-role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;
}
