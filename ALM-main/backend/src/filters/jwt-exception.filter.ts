import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenExpiredError } from 'jsonwebtoken';

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const error = exception.getResponse() as any;

    if (
      error?.message === 'jwt expired' ||
      exception.cause instanceof TokenExpiredError
    ) {
      return response.status(401).json({
        statusCode: 401,
        error: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please login again.',
      });
    }

    response.status(401).json(
      error || {
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'Unauthorized access',
      },
    );
  }
}
