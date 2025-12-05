import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import logger from '../../utils/logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const delay = Date.now() - now;

          logger.info(
            `${method} ${url} ${statusCode} - ${ip} - ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          logger.error(
            `${method} ${url} - ${ip} - ${delay}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}

