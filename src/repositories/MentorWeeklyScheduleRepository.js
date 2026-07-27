import { AbstractRepository } from './AbstractRepository';
import db from '../models';

export default class MentorWeeklyScheduleRepository extends AbstractRepository {
  constructor() {
    super();
    this.model = db.MentorWeeklySchedule;
    this.includeMentorProfile = false;
  }

  withMentorProfile() {
    this.includeMentorProfile = true;
    return this;
  }

  filterByMentorId(mentorId) {
    this.filters.mentorId = mentorId;
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

    if (this.includeMentorProfile) {
      newOpts.include.push({
        association: 'mentorProfile',
        required: false,
      });
    }

    return newOpts;
  }
}
