import mentorService from '../services/MentorService';
import mentorTransformer from '../transformers/MentorTransformer';
import BaseHandler from './BaseHandler';

export default class MentorHandler extends BaseHandler {
  static async list(req) {
    const opts = this.getListOpts(req);

    const data = await mentorService.listAll(opts);
    const transform = mentorTransformer.collection.bind(mentorTransformer);

    if (data.rows) {
      return this.listWithPagination(data, req, transform);
    }

    return { list: data };
  }
}
