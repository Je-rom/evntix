import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../shared/enums/enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  @IsNotEmpty({ message: 'Please input your email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Please input your first name' })
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  first_name: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Please input your second name' })
  @IsString({ message: 'Second name must be a string' })
  @MinLength(2, { message: 'Second name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Second name must not exceed 50 characters' })
  second_name: string;

  @Column({ type: 'text', nullable: true })
  @IsNotEmpty({ message: 'Please input your password' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password?: string;

  @Column({ type: 'enum', enum: Role, default: Role.REGULAR_USER })
  @IsEnum(Role)
  role: Role;

  @Column({ type: 'text', nullable: true })
  googleId?: string;
}
