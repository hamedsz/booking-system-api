import Validator from 'validatorjs';
import { validate } from 'uuid';

// Register custom validators
Validator.register('uuid', (value) => validate(value), 'The :attribute is not a valid UUID.');

Validator.register('iso8601', (value) => {
  if (typeof value !== 'string') return false;

  const isoRegEx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

  if (!isoRegEx.test(value)) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}, 'The :attribute must be a valid ISO 8601 timestamp.');

// Export if needed
export default Validator;
