import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';


@Injectable()
export class RolesGuard implements CanActivate {

    constructor(
        private reflector: Reflector
    ) { }


    canActivate(
        context: ExecutionContext
    ) {

        const requiredRoles =
            this.reflector.get<string[]>(
                'roles',
                context.getHandler()
            );


        if (!requiredRoles)
            return true;


        const request =
            context.switchToHttp()
                .getRequest();


        const user = request.user;


        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                "No permission"
            );
        }


        return true;

    }

}