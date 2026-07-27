import { DateTime } from 'luxon';
import BookingRepository from '../repositories/BookingRepository';
import MentorRepository from '../repositories/MentorRepository';
import MentorWeeklyScheduleRepository from '../repositories/MentorWeeklyScheduleRepository';
import MentorSceduleExceptionRepository from '../repositories/MentorScheduleExceptionRepository';
import cache from '../core/Cache';
import MentorNotAcceptBookingError from '../errors/MentorNotAcceptBookingError';
import MentorNotFoundError from '../errors/MentorNotFoundError';
import SlotNotAvailableError from '../errors/SlotNotAvailableError';
import SlotAlreadyBookedError from '../errors/SlotAlreadyBookedError';
import notificationQueue from '../queues/NotificationQueue';

class BookingService {
  constructor() {
    this.bookingRepository = new BookingRepository();
    this.mentorWeeklyScheduleRepository = new MentorWeeklyScheduleRepository();
    this.mentorRepository = new MentorRepository();
    this.mentorSceduleExceptionRepository = new MentorSceduleExceptionRepository();
  }

  async createBooking({
    userId, mentorId, startDateTime, endDateTime,
  }) {
    // 1. Validate the slot is legitimately part of their schedule
    // We fetch availabilities for just this specific day to ensure it aligns with
    // their schedules, timezone, and exceptions.
    const dayStart = DateTime.fromISO(startDateTime).startOf('day').toISO();
    const dayEnd = DateTime.fromISO(startDateTime).endOf('day').toISO();

    const dailySlots = await this.getAvailablities({
      mentorId,
      from: dayStart,
      to: dayEnd,
    });

    console.log(dailySlots[0], startDateTime, endDateTime);

    const isValidAndAvailableSlot = dailySlots.find(
      (slot) => slot.start === startDateTime && slot.end === endDateTime && slot.available,
    );

    if (!isValidAndAvailableSlot) {
      throw new SlotNotAvailableError();
    }

    // 2. Handle Race Conditions using Database Transactions & Locks
    // Note: .transaction() and .hasConflictingBooking() require implementation in your ORM/DB layer
    const booking = await this.bookingRepository.createTransaction(async (trx) => {
      // Pessimistic Lock: Check for overlapping bookings inside the transaction.
      // In SQL, this query should use `FOR UPDATE` so concurrent requests wait in line.
      const isConflict = await this.bookingRepository.hasConflictingBooking({
        mentorId,
        startDateTime,
        endDateTime,
        trx, // Pass transaction client
      });

      if (isConflict) {
        throw new SlotAlreadyBookedError();
      }

      // 3. Create the actual booking record
      const newBooking = await this.bookingRepository.create({
        userId,
        mentorId,
        startDateTime,
        endDateTime,
        status: 'CONFIRMED',
      }, trx);

      return newBooking;
    });

    // 4. Cache Invalidation
    // Clear the availabilities cache for this mentor so subsequent requests see it as booked.
    await cache.forgetByPattern(`availabilities:${mentorId}:*`);

    await notificationQueue.add('booking-confirmed', {
      bookingId: booking.id,
      userId,
      mentorId,
      startDateTime,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    return booking;
  }

  async getAvailablities({ mentorId, from, to }) {
    const cacheKey = `availabilities:${mentorId}:${cache.generateKey({ from, to })}`;
    const cacheTTL = 60;

    return cache.remember(cacheKey, cacheTTL, async () => {
      // 1. Fetch mentor first (since we need to check if they accept bookings)
      const mentor = await this.mentorRepository.getById(mentorId);

      if (!mentor) throw new MentorNotFoundError();

      if (!mentor.isAcceptingBookings) throw new MentorNotAcceptBookingError();

      // 2. Fetch everything else CONCURRENTLY
      const [weeklySchedules, exceptions, bookings] = await Promise.all([
        this.mentorWeeklyScheduleRepository.filterByMentorId(mentorId).all(),
        this.mentorSceduleExceptionRepository
          .filterByMentorId(mentorId)
          .betweenDates(from, to)
          .all(),
        this.bookingRepository
          .filterByMentorId(mentorId)
          .betweenDates(from, to)
          .notCancelled()
          .all(),
      ]);

      // 3. Convert arrays to Maps/Sets for O(1) instant lookups!
      const scheduleMap = new Map(weeklySchedules.map((s) => [s.dayOfWeek, s]));
      const exceptionMap = new Map(exceptions.map((e) => [e.date, e]));

      // Create a Set of exact UTC start times that are booked
      const bookedTimesUTC = new Set(
        bookings.map((b) => DateTime.fromJSDate(b.startDateTime).toUTC().toISO()),
      );

      const slots = [];
      const now = DateTime.now().setZone(mentor.timezone);

      let currentDate = DateTime.fromISO(from, { zone: mentor.timezone }).startOf('day');
      const endDate = DateTime.fromISO(to, { zone: mentor.timezone }).endOf('day');

      while (currentDate <= endDate) {
        const dateString = currentDate.toISODate();
        const dayOfWeek = currentDate.weekday % 7;
        let workingHours = null;

        // O(1) Instant lookups instead of .find()
        const exception = exceptionMap.get(dateString);

        if (exception?.type !== 'DAY_OFF') {
          if (exception?.type === 'CUSTOM_HOUNT' || exception?.type === 'CUSTOM_HOURS') {
            workingHours = { startTime: exception.startTime, endTime: exception.endTime };
          } else {
            const schedule = scheduleMap.get(dayOfWeek);
            if (schedule) {
              workingHours = { startTime: schedule.startTime, endTime: schedule.endTime };
            }
          }
        }

        if (workingHours) {
          // Fast slot generation
          const daySlots = this.fastGenerateSlots({
            date: currentDate,
            startTime: workingHours.startTime,
            endTime: workingHours.endTime,
            duration: mentor.meetingDurationMinutes,
            bookedTimesUTC, // pass the pre-computed set
            now,
          });

          slots.push(...daySlots);
        }
        currentDate = currentDate.plus({ days: 1 });
      }

      return slots;
    });
  }

  fastGenerateSlots({
    date, startTime, endTime, duration, bookedTimesUTC, now,
  }) {
    const result = [];
    // Split the time string (e.g., "09:00") manually to avoid heavy parsing
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let cursor = date.set({ hour: startHour, minute: startMinute });
    const end = date.set({ hour: endHour, minute: endMinute });

    while (cursor.plus({ minutes: duration }) <= end) {
      // Only process future slots immediately, saves memory
      if (cursor > now) {
        const startUTC = cursor.toUTC().toISO();

        // O(1) Instant lookup instead of .some()!
        const isBooked = bookedTimesUTC.has(startUTC);

        result.push({
          start: startUTC,
          end: cursor.plus({ minutes: duration }).toUTC().toISO(),
          available: !isBooked,
        });
      }
      cursor = cursor.plus({ minutes: duration });
    }
    return result;
  }

  listAll(opts) {
    const repo = this.getBookingRepositry(opts);

    return repo.all();
  }

  getBookingRepositry(opts = {}) {
    const { page, sort } = opts || {};
    const repo = this.bookingRepository.withMentor().withUser();

    if (page) {
      const { current, size } = page;
      repo.setPage(current, size);
    }

    if (sort && sort.length > 0) {
      const field = sort[0];
      const direction = sort[1] ? sort[1] : null;
      repo.sortBy(field, direction);
    } else {
      repo.sortBy('createdAt', 'DESC');
    }

    return repo;
  }
}

export default new BookingService();
