import * as Sentry from '@sentry/node';
import { serializeError } from 'serialize-error';
import ApiError from '../errors/ApiError';
import Logger from '../core/Logger';
import { NODE_ENV } from '../config/app';

export class ErrorService {
  handle({
    err, method, path, reqId, originalUrl, body, query, headers,
  }) {
    const standardResponse = {
      error: err instanceof ApiError ? err.toExternalResponse() : {
        status: 500,
        message: NODE_ENV === 'production' ? 'Server Error' : err.message,
        type: 'server_error',
        code: 'server_error',
      },
    };

    if (!(err instanceof ApiError)) {
      Logger.error({
        ...err,
        stack: err.stack,
      });

      // Send error to sentry
      Sentry.withScope((scope) => {
        scope.setTags({
          app: 'Zabanoosh Backend',
          methodPath: `${method} ${path}`,
          respStatus: err.status || 500,
          requestId: reqId,
        });

        scope.addEventProcessor((event, _hint) => {
          const e = event;
          e.request = {
            url: originalUrl,
            data: body,
            query_string: query,
            headers,
          };
          e.timestamp = Date.now();

          return e;
        });
        scope.setExtras(serializeError(err));
        Sentry.captureException(err);
      });
    }

    return standardResponse;
  }
}

export default new ErrorService();
