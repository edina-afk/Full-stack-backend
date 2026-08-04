import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LedgerModule } from './ledger/ledger.module';
import { MemberModule } from './member/member.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    UserModule,
    MemberModule,
    LedgerModule,
    PaymentModule,
  ],

  controllers: [],

  providers: [],

})
export class AppModule {}