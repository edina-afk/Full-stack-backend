import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
	imports: [AuthModule],
	controllers: [MemberController],
	providers: [MemberService, JwtGuard, RolesGuard],
})
export class MemberModule {}