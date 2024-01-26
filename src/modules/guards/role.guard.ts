// role.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private roles: string[]) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userRoles = request['user_data']?.role; // Truy cập trường role từ request['user_data']
    
    // Kiểm tra xem userRoles đã được xác định và có vai trò cần thiết hay không
    const hasRequiredRole = userRoles && this.roles.includes(userRoles);
    return hasRequiredRole;
  }
}