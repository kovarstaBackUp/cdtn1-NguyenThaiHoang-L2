import { AppError } from '#errors/app-error';
import type { Actor } from '#services/access';

export function requireActor(locals: App.Locals): Actor {
  if (!locals.employee) {
    throw new AppError('UNAUTHENTICATED', 'Vui lòng đăng nhập');
  }

  return locals.employee;
}
