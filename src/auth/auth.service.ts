import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from "argon2";
import { AuthDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SigninDto } from '../dto/signin.dto';
import { MailService } from '../mail/mail.service';


@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) { }


  async signup(dto: AuthDto) {

    // Check existing email
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });

    if (existingUser) {
      throw new BadRequestException(
        "Email already exists"
      );
    }


    const hash = await argon.hash(dto.password);


    const otp = "123456";

    const user = await this.prisma.user.create({

      data: {

        email: dto.email,

        hash,

        firstName: dto.firstName,

        lastName: dto.lastName,

        otpCode: otp,

        otpExpires: new Date(
          Date.now() + 10 * 60 * 1000
        ),

      }

    });


    // Send OTP using Resend
    await this.mailService.sendOtp(
      user.email,
      otp
    );


    return {

      message: "OTP sent",

      email: user.email

    };

  }


   async signin(dto: SigninDto) {
  const user = await this.prisma.user.findUnique({
    where: {
      email: dto.email,
    },
  });

  if (!user) {
    throw new ForbiddenException("Invalid credentials");
  }

  const passwordMatch = await argon.verify(
    user.hash,
    dto.password,
  );

  if (!passwordMatch) {
    throw new ForbiddenException("Invalid credentials");
  }

   const token = await this.signToken(
 user.id,
 user.email,
 user.role
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
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ForbiddenException("User not found");
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
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
  }

  async verifyOtp(dto: VerifyOtpDto) {

    console.log("VERIFY OTP FUNCTION RUNNING");
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException("User not found");
    }

    if (user.otpCode !== dto.otp) {
      throw new ForbiddenException("Invalid OTP");
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new ForbiddenException("OTP expired");
    }

    await this.prisma.user.update({
      where: {
        email: dto.email,
      },
      data: {
        otpCode: null,
        otpExpires: null,
      },
    });


     const token = await this.signToken(
  user.id,
  user.email,
  user.role
);


    console.log("VERIFY USER:", user);

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
userId:number,
email:string,
role:string
): Promise<{ access_token: string }> {


    const payload = {

      sub: userId,

      email,

    };


    const secret = this.config.get<string>(
      "JWT_SECRET"
    );



    const token = await this.jwt.signAsync(

      payload,

      {

        expiresIn: "15m",

        secret,

      }

    );


    return {

      access_token: token

    };


  }




  async forgotPassword(dto: ForgotPasswordDto) {


    const user = await this.prisma.user.findUnique({

      where: {

        email: dto.email

      }

    });



    if (!user) {

      throw new ForbiddenException(
        "User not found"
      );

    }



    const otp = Math.floor(

      100000 + Math.random() * 900000

    ).toString();



    const expires = new Date(

      Date.now() + 5 * 60 * 1000

    );



    await this.prisma.user.update({

      where: {

        email: dto.email

      },

      data: {

        otpCode: otp,

        otpExpires: expires

      }

    });



    // Resend password OTP
    await this.mailService.sendOtp(

      user.email,

      otp

    );



    return {

      message: "OTP sent to your email"

    };


  }




  async resetPassword(dto: ResetPasswordDto) {


    const user = await this.prisma.user.findUnique({

      where: {

        email: dto.email

      }

    });



    if (!user) {

      throw new ForbiddenException(
        "User not found"
      );

    }



    if (user.otpCode !== dto.otp) {

      throw new ForbiddenException(
        "Invalid OTP"
      );

    }



    if (
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {

      throw new ForbiddenException(
        "OTP expired"
      );

    }



    const hash = await argon.hash(

      dto.newPassword

    );



    await this.prisma.user.update({

      where: {

        email: dto.email

      },

      data: {

        hash,

        otpCode: null,

        otpExpires: null

      }

    });



    return {

      message: "Password reset successfully"

    };


  }

}