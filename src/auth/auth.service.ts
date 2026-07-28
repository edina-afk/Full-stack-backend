import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from "argon2"
import { AuthDto } from '../dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SigninDto } from '../dto/signin.dto';
@Injectable()
export class AuthService {
    constructor(
      private prisma: PrismaService,
      private jwt: JwtService,
      private config :ConfigService,
     private mailerService: MailerService,
    ){}
                 
        
  async signup(dto: AuthDto){

 const hash = await argon.hash(dto.password);

 const otp = Math.floor(100000 + Math.random() * 900000).toString();

 const user = await this.prisma.user.create({
   data:{
     email: dto.email,
     hash,
     firstName: dto.firstName,
     lastName: dto.lastName,

     otpCode: otp,
     otpExpires: new Date(Date.now() + 10 * 60 * 1000),
   }
 });


 await this.mailerService.sendMail({
   to: dto.email,
   subject: "Verify your account",
   text: `Your OTP code is ${otp}`,
 });


 return {
   message:"OTP sent",
   email:user.email
 };
}


   async signin(dto: SigninDto){

 const user = await this.prisma.user.findUnique({
   where:{
     email:dto.email
   }
 });

 if(!user){
   throw new ForbiddenException("Invalid credentials");
 }


 const passwordMatch = await argon.verify(
   user.hash,
   dto.password
 );


 if(!passwordMatch){
   throw new ForbiddenException("Invalid credentials");
 }


 const token = await this.signToken(
   user.id,
   user.email
 );


 return {
   access_token: token
 };

}

 async signToken(
    userId:number,
    email:string):Promise<{access_token:string}>{
    const  payload ={
      sub: userId,
      email,
    };

    const secret = this.config.get("JWT_SECRET");

    const token = await this.jwt.signAsync(payload , {
      expiresIn: '15m',
      secret:secret,
    })

    return{
      access_token:token
    }
   
  }  
 
  async verifyOtp(dto: VerifyOtpDto){

  const user = await this.prisma.user.findUnique({
    where:{
      email:dto.email
    }
  });

  if(!user){
    throw new ForbiddenException("User not found");
  }

  if(user.otpCode !== dto.otp){
    throw new ForbiddenException("Invalid OTP");
  }

  if(!user.otpExpires || user.otpExpires < new Date()){
    throw new ForbiddenException("OTP expired");
  }


  const token = await this.signToken(
    user.id,
    user.email
  );


  return token;
}
 async forgotPassword(dto: ForgotPasswordDto){

  const user = await this.prisma.user.findUnique({
    where:{
      email: dto.email
    }
  });


  if(!user){
    throw new ForbiddenException("User not found");
  }


  const otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();


  const expires = new Date(
    Date.now() + 5 * 60 * 1000
  );


  await this.prisma.user.update({
    where:{
      email:dto.email
    },
    data:{
      otpCode: otp,
      otpExpires: expires
    }
  });


  await this.mailerService.sendMail({
    to:user.email,
    subject:"Password Reset OTP",
    text:`Your OTP code is ${otp}`
  });


  return {
    message:"OTP sent to your email"
  };

}


async resetPassword(dto: ResetPasswordDto){

  const user = await this.prisma.user.findUnique({
    where:{
      email:dto.email
    }
  });


  if(!user){
    throw new ForbiddenException("User not found");
  }


  if(user.otpCode !== dto.otp){
    throw new ForbiddenException("Invalid OTP");
  }


  if(!user.otpExpires || user.otpExpires < new Date()){
    throw new ForbiddenException("OTP expired");
  }


  const hash = await argon.hash(dto.newPassword);


  await this.prisma.user.update({
    where:{
      email:dto.email
    },
    data:{
      hash,

      // remove OTP after successful reset
      otpCode:null,
      otpExpires:null
    }
  });


  return {
    message:"Password reset successfully"
  };

}
};
