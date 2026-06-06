import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url, query, body } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: (responseBody: unknown) => {
          const res = context.switchToHttp().getResponse<Response>();
          const ms = Date.now() - start;
          this.logger.log(
            `${method} ${url} → ${res.statusCode} (${ms}ms)\n` +
            (Object.keys(query).length ? `  query    ${JSON.stringify(query)}\n` : '') +
            (body && Object.keys(body).length ? `  body     ${JSON.stringify(body)}\n` : '') +
            `  response ${JSON.stringify(responseBody)}`,
          );
        },
        error: (err: { status?: number; message?: string }) => {
          const status = err?.status ?? 500;
          const ms = Date.now() - start;
          this.logger.error(
            `${method} ${url} → ${status} (${ms}ms)\n` +
            (Object.keys(query).length ? `  query    ${JSON.stringify(query)}\n` : '') +
            (body && Object.keys(body).length ? `  body     ${JSON.stringify(body)}\n` : '') +
            `  error    ${err?.message ?? 'Unknown error'}`,
          );
        },
      }),
    );
  }
}
