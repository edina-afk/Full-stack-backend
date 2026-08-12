import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SigninDto } from '../dto/signin.dto';
import { MailService } from '../mail/mail.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async signup(dto: AuthDto) {
    // Check existing email
    const existingUser = await this.db.query(
      `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
      [dto.email],
    );

    if (existingUser.rows.length > 0) {
      throw new BadRequestException('Email already exists');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const otp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    const result = await this.db.query(
      `INSERT INTO "User"
        (email, hash, "firstName", "lastName", role, "otpCode", "otpExpires", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'ADMIN', $5, $6, NOW(), NOW())
       RETURNING id, email, "firstName", "lastName", role`,
      [
        dto.email,
        hash,
        dto.firstName,
        dto.lastName || null,
        otp,
        otpExpires,
      ],
    );

    const user = result.rows[0];

    await this.mailService.sendOtp(user.email, otp);

    return {
      message: 'OTP sent',
      email: user.email,
    };
  }
async createAdmin(
  dto: AuthDto,
  superAdminEmail: string,
) {
  // 1. Check that the requester is SUPERADMIN
  const superAdminResult = await this.db.query(
    `SELECT id, email, role
     FROM "User"
     WHERE email = $1
     LIMIT 1`,
    [superAdminEmail],
  );

  const superAdmin = superAdminResult.rows[0];

  if (!superAdmin) {
    throw new ForbiddenException(
      'Superadmin not found',
    );
  }

  if (superAdmin.role !== 'SUPERADMIN') {
    throw new ForbiddenException(
      'Only SUPERADMIN can create admins',
    );
  }

  // 2. Check if email already exists
  const existingUser = await this.db.query(
    `SELECT id
     FROM "User"
     WHERE email = $1
     LIMIT 1`,
    [dto.email],
  );

  if (existingUser.rows.length > 0) {
    throw new BadRequestException(
      'Email already exists',
    );
  }

  // 3. Hash password
  const hash = await bcrypt.hash(
    dto.password,
    10,
  );

  // 4. Generate OTP
  const otp = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const otpExpires = new Date(
    Date.now() + 10 * 60 * 1000,
  );

  // 5. Create ADMIN
  const result = await this.db.query(
    `INSERT INTO "User"
      (
        email,
        hash,
        "firstName",
        "lastName",
        role,
        "otpCode",
        "otpExpires",
        "createdAt",
        "updatedAt"
      )
     VALUES
      (
        $1,
        $2,
        $3,
        $4,
        'ADMIN',
        $5,
        $6,
        NOW(),
        NOW()
      )
     RETURNING
       id,
       email,
       "firstName",
       "lastName",
       role`,
    [
      dto.email,
      hash,
      dto.firstName,
      dto.lastName || null,
      otp,
      otpExpires,
    ],
  );

  const admin = result.rows[0];

  // 6. Send OTP to the new ADMIN
  await this.mailService.sendOtp(
    admin.email,
    otp,
  );

  return {
    message: 'Admin created. OTP sent.',
    email: admin.email,
  };
}
  async signin(dto: SigninDto) {
    const result = await this.db.query(
      `SELECT id, email, hash, "firstName", "lastName", role
       FROM "User"
       WHERE email = $1
       LIMIT 1`,
      [dto.email],
    );

    const user = result.rows[0];

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.hash,
    );

    if (!passwordMatch) {
      throw new ForbiddenException('Invalid credentials');
    }

    const token = await this.signToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      access_token: token.access_token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMe(userId: number) {
    const result = await this.db.query(
      `SELECT
        id,
        "firstName",
        "lastName",
        email,
        role,
        "createdAt"
       FROM "User"
       WHERE id = $1
       LIMIT 1`,
      [userId],
    );

    const user = result.rows[0];

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: number,
    data: {
      firstName?: string;
      lastName?: string;
    },
  ) {
    const result = await this.db.query(
      `UPDATE "User"
       SET
         "firstName" = COALESCE($1, "firstName"),
         "lastName" = COALESCE($2, "lastName"),
         "updatedAt" = NOW()
       WHERE id = $3
       RETURNING id, "firstName", "lastName", email`,
      [
        data.firstName ?? null,
        data.lastName ?? null,
        userId,
      ],
    );

    const user = result.rows[0];

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return user;
  }

  async verifyOtp(dto: VerifyOtpDto) {
    console.log('VERIFY OTP FUNCTION RUNNING');

    const result = await this.db.query(
      `SELECT
        id,
        email,
        "firstName",
        "lastName",
        role,
        "otpCode",
        "otpExpires"
       FROM "User"
       WHERE email = $1
       LIMIT 1`,
      [dto.email],
    );

    const user = result.rows[0];

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.otpCode !== dto.otp) {
      throw new ForbiddenException('Invalid OTP');
    }

    if (
      !user.otpExpires ||
      new Date(user.otpExpires) < new Date()
    ) {
      throw new ForbiddenException('OTP expired');
    }

    await this.db.query(
      `UPDATE "User"
       SET
         "otpCode" = NULL,
         "otpExpires" = NULL,
         "updatedAt" = NOW()
       WHERE email = $1`,
      [dto.email],
    );

    const token = await this.signToken(
      user.id,
      user.email,
      user.role,
    );

    console.log('VERIFY USER:', user);

    return {
      access_token: token.access_token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async signToken(
    userId: number,
    email: string,
    role: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const secret = this.config.get<string>('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return {
      access_token: token,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const result = await this.db.query(
      `SELECT id, email
       FROM "User"
       WHERE email = $1
       LIMIT 1`,
      [dto.email],
    );

    const user = result.rows[0];

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const expires = new Date(
      Date.now() + 5 * 60 * 1000,
    );

    await this.db.query(
      `UPDATE "User"
       SET
         "otpCode" = $1,
         "otpExpires" = $2,
         "updatedAt" = NOW()
       WHERE email = $3`,
      [otp, expires, dto.email],
    );

    await this.mailService.sendOtp(
      user.email,
      otp,
    );

    return {
      message: 'OTP sent to your email',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const result = await this.db.query(
      `SELECT
        id,
        "otpCode",
        "otpExpires"
       FROM "User"
       WHERE email = $1
       LIMIT 1`,
      [dto.email],
    );

    const user = result.rows[0];

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.otpCode !== dto.otp) {
      throw new ForbiddenException('Invalid OTP');
    }

    if (
      !user.otpExpires ||
      new Date(user.otpExpires) < new Date()
    ) {
      throw new ForbiddenException('OTP expired');
    }

    const hash = await bcrypt.hash(
      dto.newPassword,
      10,
    );

    await this.db.query(
      `UPDATE "User"
       SET
         hash = $1,
         "otpCode" = NULL,
         "otpExpires" = NULL,
         "updatedAt" = NOW()
       WHERE email = $2`,
      [hash, dto.email],
    );

    return {
      message: 'Password reset successfully',
    };
  }
}