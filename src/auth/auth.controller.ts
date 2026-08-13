import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthDto } from '../dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SigninDto } from '../dto/signin.dto';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UseGuards, Request } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  // =========================
  // SIGN UP
  // =========================
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  // =========================
  // SIGN IN
  // =========================
  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  // =========================
  // VERIFY OTP
  // =========================
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // =========================
  // FORGOT PASSWORD
  // =========================
  @Post('forgot-password')
  forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto);
  }

  // =========================
  // RESET PASSWORD
  // =========================
  @Post('reset-password')
  resetPassword(
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto);
  }

  // =========================
  // CREATE ADMIN
  // =========================
  @Post('create-admin')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('SUPERADMIN')
  createAdmin(@Body() dto: CreateAdminDto, @Request() req: any) {
    const requesterEmail = req.user?.email;
    return this.authService.createAdmin(dto, requesterEmail);
  }
}