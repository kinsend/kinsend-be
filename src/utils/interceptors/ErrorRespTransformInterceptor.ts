import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ErrorRespTransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request: Express.Request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      catchError((error) => {
        return throwError(error);
      }),
    );
  }
}
