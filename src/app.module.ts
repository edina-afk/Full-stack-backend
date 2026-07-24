import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MemberModule } from './member/member.module';
import { LedgerModule } from './ledger/ledger.module';
 

 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, 
    AuthModule, 
    UserModule, 
    MemberModule, LedgerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
