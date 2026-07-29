import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
 
import { MailModule } from '../mail/mail.module';



@Module({
  imports: [PrismaModule,JwtModule.register({}),MailModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
