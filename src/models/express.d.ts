import type { JwtPayload } from '@models/jwtPayload';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      token?: string;
    }
  }
}
