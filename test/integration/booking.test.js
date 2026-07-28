/* eslint-disable max-classes-per-file */
/* eslint-disable import/first */
import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';
import request from 'supertest';
import { DateTime } from 'luxon';
import app from '../../src/app';

// 1. Mock Middlewares (Must be declared before importing app)
jest.mock('../../src/middlewares/ratelimiter', () => ({
  normalLimiter: (req, res, next) => next(),
  secureLimiter: (req, res, next) => next(),
}));

jest.mock('../../src/middlewares/authorization', () => (req, res, next) => {
  req.user = { id: 'f04e4ba6-d94d-4267-bd7e-72dea186af46' };
  next();
});

// 2. Mock Repositories with explicit prototypes
jest.mock('../../src/repositories/MentorRepository', () => {
  class MockMentorRepo {}
  MockMentorRepo.prototype.getById = jest.fn();
  return { __esModule: true, default: MockMentorRepo };
});

jest.mock('../../src/repositories/BookingRepository', () => {
  class MockBookingRepo {}
  MockBookingRepo.prototype.filterByMentorId = jest.fn();
  MockBookingRepo.prototype.betweenDates = jest.fn();
  MockBookingRepo.prototype.notCancelled = jest.fn();
  MockBookingRepo.prototype.all = jest.fn();
  MockBookingRepo.prototype.createTransaction = jest.fn();
  MockBookingRepo.prototype.hasConflictingBooking = jest.fn();
  MockBookingRepo.prototype.create = jest.fn();
  return { __esModule: true, default: MockBookingRepo };
});

jest.mock('../../src/repositories/MentorWeeklyScheduleRepository', () => {
  class MockWeeklyScheduleRepo {}
  MockWeeklyScheduleRepo.prototype.filterByMentorId = jest.fn();
  MockWeeklyScheduleRepo.prototype.all = jest.fn();
  return { __esModule: true, default: MockWeeklyScheduleRepo };
});

jest.mock('../../src/repositories/MentorScheduleExceptionRepository', () => {
  class MockScheduleExceptionRepo {}
  MockScheduleExceptionRepo.prototype.filterByMentorId = jest.fn();
  MockScheduleExceptionRepo.prototype.betweenDates = jest.fn();
  MockScheduleExceptionRepo.prototype.all = jest.fn();
  return { __esModule: true, default: MockScheduleExceptionRepo };
});

jest.mock('../../src/core/Cache', () => {
  const mockCache = {
    generateKey: jest.fn().mockImplementation((opts) => JSON.stringify(opts)),
    remember: jest.fn(async (key, ttl, cb) => cb()),
    forgetByPattern: jest.fn().mockResolvedValue(true),
  };

  return {
    __esModule: true,
    default: mockCache,
    ...mockCache,
  };
});

jest.mock('../../src/queues/NotificationQueue', () => {
  const mockNotification = {
    add: jest.fn().mockResolvedValue(true),
  };

  return {
    __esModule: true,
    default: mockNotification,
    ...mockNotification,
  };
});

// Import mocks to configure them per test
import MentorRepository from '../../src/repositories/MentorRepository';
import BookingRepository from '../../src/repositories/BookingRepository';
import MentorWeeklyScheduleRepository from '../../src/repositories/MentorWeeklyScheduleRepository';
import MentorSceduleExceptionRepository from '../../src/repositories/MentorScheduleExceptionRepository';

describe('POST /bookings Integration Tests', () => {
  let validPayload;
  let tomorrow;

  beforeEach(() => {
    jest.clearAllMocks();

    tomorrow = DateTime.now().plus({ days: 1 }).setZone('UTC');
    const startDateTime = tomorrow.set({
      hour: 9, minute: 0, second: 0, millisecond: 0,
    }).toISO();
    const endDateTime = tomorrow.set({
      hour: 10, minute: 0, second: 0, millisecond: 0,
    }).toISO();

    validPayload = {
      mentorId: '242850ed-cfdc-478e-a454-51ade640c447',
      startDateTime,
      endDateTime,
    };

    // --- Happy Path Default Mocks ---

    // 1. Mentor Repo
    MentorRepository.prototype.getById.mockResolvedValue({
      id: validPayload.mentorId,
      isAcceptingBookings: true,
      timezone: 'UTC',
      meetingDurationMinutes: 60,
    });

    // 2. Weekly Schedule Repo (Chainable)
    MentorWeeklyScheduleRepository.prototype.filterByMentorId.mockReturnThis();
    MentorWeeklyScheduleRepository.prototype.all.mockResolvedValue([{
      dayOfWeek: tomorrow.weekday % 7,
      startTime: '09:00',
      endTime: '17:00',
    }]);

    // 3. Exceptions Repo (Chainable)
    MentorSceduleExceptionRepository.prototype.filterByMentorId.mockReturnThis();
    MentorSceduleExceptionRepository.prototype.betweenDates.mockReturnThis();
    MentorSceduleExceptionRepository.prototype.all.mockResolvedValue([]); // No exceptions

    // 4. Booking Repo (Chainable)
    BookingRepository.prototype.filterByMentorId.mockReturnThis();
    BookingRepository.prototype.betweenDates.mockReturnThis();
    BookingRepository.prototype.notCancelled.mockReturnThis();
    BookingRepository.prototype.all.mockResolvedValue([]); // No conflicting bookings in cache

    BookingRepository.prototype.createTransaction.mockImplementation(async (cb) => {
      const mockTrx = {};
      return cb(mockTrx);
    });

    BookingRepository.prototype.hasConflictingBooking.mockResolvedValue(false);
    BookingRepository.prototype.create.mockResolvedValue({
      id: 'ce5ca37d-3d4b-40b3-a56f-7f5d372937ad',
      ...validPayload,
      userId: 'f04e4ba6-d94d-4267-bd7e-72dea186af46',
      status: 'CONFIRMED',
    });
  });

  it('should successfully create a booking, invalidate cache, and queue notification', async () => {
    const res = await request(app)
      .post('/bookings')
      .send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body.booking).toHaveProperty('id', 'ce5ca37d-3d4b-40b3-a56f-7f5d372937ad');

    expect(MentorRepository.prototype.getById).toHaveBeenCalledWith(validPayload.mentorId);
    expect(BookingRepository.prototype.createTransaction).toHaveBeenCalled();
    expect(BookingRepository.prototype.hasConflictingBooking).toHaveBeenCalled();
  });

  it('should return error when send invalid uuid for mentorId', async () => {
    const res = await request(app)
      .post('/bookings')
      .send({
        ...validPayload,
        mentorId: 'invalid-uuid',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'body_invalid');

    expect(MentorRepository.prototype.getById).not.toHaveBeenCalled();
    expect(BookingRepository.prototype.createTransaction).not.toHaveBeenCalled();
  });

  it('should return error when send invalid dates', async () => {
    const res = await request(app)
      .post('/bookings')
      .send({
        ...validPayload,
        startDateTime: 'invalid-date',
        endDateTime: 'invalid-date',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'body_invalid');

    expect(MentorRepository.prototype.getById).not.toHaveBeenCalled();
    expect(BookingRepository.prototype.createTransaction).not.toHaveBeenCalled();
  });

  it('should return error when mentor not found', async () => {
    MentorRepository.prototype.getById.mockResolvedValue(null);

    const res = await request(app)
      .post('/bookings')
      .send({
        ...validPayload,
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'not_found');

    expect(MentorRepository.prototype.getById).toHaveBeenCalled();
    expect(BookingRepository.prototype.createTransaction).not.toHaveBeenCalled();
  });

  it('should return error when mentor not accepting bookings', async () => {
    MentorRepository.prototype.getById.mockResolvedValue({
      id: validPayload.mentorId,
      isAcceptingBookings: false,
      timezone: 'UTC',
      meetingDurationMinutes: 60,
    });

    const res = await request(app)
      .post('/bookings')
      .send({
        ...validPayload,
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'forbidden');

    expect(MentorRepository.prototype.getById).toHaveBeenCalled();
    expect(BookingRepository.prototype.createTransaction).not.toHaveBeenCalled();
  });

  it('should return error when slot is not available', async () => {
    const startDateTime = tomorrow.set({
      hour: 9, minute: 43, second: 0, millisecond: 0,
    }).toISO();
    const res = await request(app)
      .post('/bookings')
      .send({
        ...validPayload,
        startDateTime,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'slot_not_available');

    expect(MentorRepository.prototype.getById).toHaveBeenCalled();
    expect(BookingRepository.prototype.createTransaction).not.toHaveBeenCalled();
  });

  it('should return error when slot is already booked', async () => {
    BookingRepository.prototype.hasConflictingBooking.mockResolvedValue(true);

    const res = await request(app)
      .post('/bookings')
      .send({
        ...validPayload,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'slot_already_booked');

    expect(MentorRepository.prototype.getById).toHaveBeenCalled();
    expect(BookingRepository.prototype.createTransaction).toHaveBeenCalled();
    expect(BookingRepository.prototype.hasConflictingBooking).toHaveBeenCalled();
  });
});
