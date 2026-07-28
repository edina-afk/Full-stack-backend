import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from '../dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SigninDto } from '../dto/signin.dto';
 


@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}
    @Post("signup")
    signup(@Body() dto: AuthDto){
        
          return this.authService.signup(dto);
    }

    @Post('signin')
signin(@Body() dto: SigninDto){
  return this.authService.signin(dto);
}

      @Post('verify-otp')
  verifyOtp(
    @Body() dto: VerifyOtpDto
  ){
    return this.authService.verifyOtp(dto);
  }
@Post('forgot-password')
forgotPassword(@Body() dto: ForgotPasswordDto){
  return this.authService.forgotPassword(dto);
}


@Post('reset-password')
resetPassword(@Body() dto: ResetPasswordDto){
  return this.authService.resetPassword(dto);
}

}
