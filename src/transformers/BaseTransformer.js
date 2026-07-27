export class BaseTransformer {
  /**
   * Transform collection.
   *
   * @param {Array} [items=[]]
   * @param {Request|null} [request=null]
   *
   * @returns {Array}
   */
  collection(items = [], request = null) {
    const result = [];

    for (let i = 0; i < items.length; i += 1) {
      const item = this.item(items[i], request);

      if (item) {
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Transform a single entity.
   * All extending classes must implement this.
   *
   * @param {Object} [item={}]
   * @param {Request|null} [request=null]
   *
   * @returns {Object}
   */
  item(_item = {}, _request = null) {
    throw Error('item() method needs to be implemented.');
  }
}

export default BaseTransformer;
