import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LedgerModule } from './ledger/ledger.module';
import { MemberModule } from './member/member.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DatabaseModule,
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