import { Op } from 'sequelize';
import { AbstractRepository } from './AbstractRepository';
import db from '../models';

export default class BookingRepository extends AbstractRepository {
  constructor() {
    super();
    this.model = db.Booking;
    this.includeMentor = false;
    this.includeUser = false;
  }

  withMentor() {
    this.includeMentor = true;
    return this;
  }

  withUser() {
    this.includeUser = true;
    return this;
  }

  /**
   * Checks for overlapping or identical active bookings for a specific mentor.
   * Utilizes an exclusive row lock (FOR UPDATE) inside the transaction.
   */
  async hasConflictingBooking({
    mentorId, startDateTime, endDateTime, trx,
  }) {
    const conflictingBooking = await this.model.findOne({
      where: {
        mentorId,
        status: { [Op.ne]: 'CANCELLED' }, // Only lock/check active bookings
        // Standard interval overlap formula: (StartA < EndB) AND (EndA > StartB)
        startDateTime: { [Op.lt]: endDateTime },
        endDateTime: { [Op.gt]: startDateTime },
      },
      // This applies the SELECT ... FOR UPDATE SQL construct
      lock: trx.LOCK.UPDATE,
      transaction: trx,
    });

    // Returns true if a conflict exists, false otherwise
    return conflictingBooking !== null;
  }

  filterByMentorId(mentorId) {
    this.filters.mentorId = mentorId;
    return this;
  }

  betweenDates(from, to) {
    this.filters.startDateTime = { [Op.between]: [from, to] };
    return this;
  }

  notCancelled() {
    this.filters.status = { [Op.ne]: 'CANCELLED' };
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

    if (this.includeMentor) {
      newOpts.include.push({
        association: 'mentorProfile',
        required: true,
        include: [
          {
            association: 'user',
            required: true,
          },
        ],
      });
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
