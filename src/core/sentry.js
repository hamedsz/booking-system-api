import * as Sentry from '@sentry/node';
import { serializeError } from 'serialize-error';
import { SENTRY_DSN, IGNORE_ERRORS } from '../config/sentry';
import { NODE_ENV } from '../config/app';

/**
 * Initialize sentry.
 *
 * @export
 */
export function init() {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
    ignoreErrors: IGNORE_ERRORS,
    beforeSend(event) {
      if (event.exception && event.exception.values[0]) {
        const isNonErrorException = event.exception.values[0].value.startsWith('Non-Error exception captured');

        if (isNonErrorException) {
          return null;
        }
      }

      return event;
    },
  });
}

/**
 * Send error to sentry.
 *
 * @export
 * @param {Error} error
 */
export function captureError(error) {
  Sentry.withScope((scope) => {
    scope.setTags({
      app: 'Sorena Backend',
    });

    scope.addEventProcessor((event, _hint) => {
      const e = event;
      e.timestamp = Date.now();

      return e;
    });
    scope.setExtras(serializeError(error));
    Sentry.captureException(error);
  });
}
