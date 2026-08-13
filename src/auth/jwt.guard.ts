import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers?.authorization as string;

    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = auth.replace('Bearer ', '').trim();

    try {
      const payload = this.jwt.verify(token);
      req.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
