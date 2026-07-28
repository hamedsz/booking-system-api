import BaseHandler from './BaseHandler';
import bookingService from '../services/BookingService';
import MentorNotFoundError from '../errors/MentorNotFoundError';
import MentorNotAcceptBookingError from '../errors/MentorNotAcceptBookingError';
import bookingTransformer from '../transformers/BookingTransformer';
import SlotNotAvailableError from '../errors/SlotNotAvailableError';
import SlotAlreadyBookedError from '../errors/SlotAlreadyBookedError';

export default class MentorHandler extends BaseHandler {
  static async availablities(req) {
    const { query, params } = req;

    this.validate(
      query,
      {
        from: 'required|date',
        to: 'required|date',
      },
      'query_invalid',
    );
    this.validate(
      params,
      {
        mentorId: 'required|uuid',
      },
      'params_invalid',
    );

    try {
      const slots = await bookingService.getAvailablities({
        mentorId: params.mentorId,
        from: query.from,
        to: query.to,
      });

      return { slots };
    } catch (err) {
      if (err instanceof MentorNotFoundError) {
        throw this.createNotFound('not_found', err.message);
      }
      if (err instanceof MentorNotAcceptBookingError) {
        throw this.createForbidden('not_accept_booking', err.message);
      }
      throw err;
    }
  }

  static async createBooking(req) {
    const { body, user } = req;

    this.validate(
      body,
      {
        mentorId: 'required|uuid',
        startDateTime: 'required|iso8601',
        endDateTime: 'required|iso8601',
      },
      'body_invalid',
    );

    try {
      const booking = await bookingService.createBooking({
        mentorId: body.mentorId,
        userId: user.id,
        startDateTime: body.startDateTime,
        endDateTime: body.endDateTime,
      });

      return { booking: bookingTransformer.item(booking) };
    } catch (err) {
      if (err instanceof MentorNotFoundError) {
        throw this.createNotFound('not_found', err.message);
      }
      if (err instanceof MentorNotAcceptBookingError) {
        throw this.createForbidden('not_accept_booking', err.message);
      }
      if (err instanceof SlotNotAvailableError) {
        throw this.createValidationError('slot_not_available', err.message);
      }
      if (err instanceof SlotAlreadyBookedError) {
        throw this.createValidationError('slot_already_booked', err.message);
      }
      throw err;
    }
  }

  static async list(req) {
    const opts = this.getListOpts(req);

    const data = await bookingService.listAll(opts);
    const transform = bookingTransformer.collection.bind(bookingTransformer);

    if (data.rows) {
      return this.listWithPagination(data, req, transform);
    }

    return { list: data };
  }
}
