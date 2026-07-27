import moment from 'moment-mini';

/**
 * Attempt to get first item from the items.
 *
 * @export
 * @param {Object|Array} items
 *
 * @returns {Mixed}
 */
export function first(items) {
  if (typeof items === 'object') {
    return items[Object.keys(items)[0]];
  }

  return items[0];
}

export function diffDate(end, start, unit = 'minutes') {
  return moment(end).diff(start, unit);
}
