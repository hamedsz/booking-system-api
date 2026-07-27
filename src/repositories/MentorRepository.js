import { AbstractRepository } from './AbstractRepository';
import db from '../models';

export default class MentorRepository extends AbstractRepository {
  constructor() {
    super();
    this.model = db.MentorProfile;
    this.includeUser = false;
  }

  withUser() {
    this.includeUser = true;
    return this;
  }

  /**
   * @inheritdoc
   */
  getOne(opts = {}) {
    return super.getOne(this.mergeOpts(opts));
  }

  all(opts = {}) {
    return super.all(this.mergeOpts(opts));
  }

  mergeOpts(opts) {
    const newOpts = {
      ...opts,
      where: { ...this.filters, ...(opts.where || {}) },
      order: this.sorts.length ? this.sorts : opts.order,
      subQuery: false,
    };

    // Apply pagination if set
    const pageOpts = this.getPageOpts();
    if (pageOpts) {
      newOpts.offset = pageOpts.offset;
      newOpts.limit = pageOpts.limit;
    }

    const { include } = newOpts;

    if (!include) {
      newOpts.include = [];
    }

    if (this.includeUser) {
      newOpts.include.push({
        association: 'user',
        required: true,
      });
    }

    return newOpts;
  }
}
