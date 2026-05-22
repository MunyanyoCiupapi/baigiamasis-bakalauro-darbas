import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ArtistOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Neautorizuota');
    }

    if (user.role !== 'ARTIST') {
      throw new ForbiddenException('Tik atlikėjai gali įkelti kūrinius');
    }

    return true;
  }
}