const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */

const firstNames = [
  'John',
  'Emma',
  'Michael',
  'Sophia',
  'James',
  'Olivia',
  'Daniel',
  'Charlotte',
  'David',
  'Amelia',
  'William',
  'Noah',
  'Lucas',
  'Benjamin',
  'Henry',
  'Ethan',
  'Ava',
  'Mia',
  'Isabella',
  'Liam',
];

const bios = [
  'Senior Backend Engineer',
  'Frontend Specialist',
  'DevOps Mentor',
  'Cloud Architect',
  'Software Engineer',
  'Tech Lead',
  'Full Stack Developer',
  'Engineering Manager',
  'Data Engineer',
  'AI Engineer',
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function randomTime(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

module.exports = {
  async up(queryInterface) {
    const users = [];
    const mentorProfiles = [];
    const weeklySchedules = [];
    const exceptions = [];

    for (let i = 1; i <= 20; i += 1) {
      const userId = uuid();
      const mentorId = uuid();
      const now = new Date();

      const firstName = pick(firstNames);
      const salt = bcrypt.genSaltSync(10);

      users.push({
        id: userId,
        firstName,
        role: 'mentor',
        isActive: true,
        email: `mentor${i}@mail.com`,
        password: bcrypt.hashSync('securep@ssword', salt),
        createdAt: now,
        updatedAt: now,
      });

      mentorProfiles.push({
        id: mentorId,
        userId,
        bio: pick(bios),
        meetingDurationMinutes: pick([30, 45, 60]),
        isAcceptingBookings: Math.random() > 0.1,
        createdAt: now,
        updatedAt: now,
      });

      // Random working days (4-6 days)
      const days = [...Array(7).keys()].sort(() => Math.random() - 0.5);
      const workingDays = days.slice(0, rand(4, 6));

      for (let j = 0; j < workingDays.length; j += 1) {
        const day = workingDays[j];

        const startHour = rand(8, 11);
        const endHour = startHour + rand(5, 8);

        weeklySchedules.push({
          mentorId,
          dayOfWeek: day,
          startTime: randomTime(startHour),
          endTime: randomTime(Math.min(endHour, 18)),
          createdAt: now,
          updatedAt: now,
        });
      }

      // Random schedule exceptions (0-3)
      const exceptionCount = rand(0, 3);

      for (let j = 0; j < exceptionCount; j += 1) {
        const date = new Date();
        date.setDate(date.getDate() + rand(1, 60));

        exceptions.push({
          mentorId,
          date: date.toISOString().split('T')[0],
          type: Math.random() > 0.5 ? 'DAY_OFF' : 'CUSTOM_HOURS',
          startTime: '10:00',
          endTime: '15:00',
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await queryInterface.bulkInsert('users', users);
    await queryInterface.bulkInsert('mentorProfiles', mentorProfiles);
    await queryInterface.bulkInsert('mentorWeeklySchedule', weeklySchedules);
    await queryInterface.bulkInsert('mentorScheduleExceptions', exceptions);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('mentorScheduleExceptions', null, {});
    await queryInterface.bulkDelete('mentorWeeklySchedule', null, {});
    await queryInterface.bulkDelete('mentorProfiles', null, {});
    await queryInterface.bulkDelete('users', {
      role: 'mentor',
    });
  },
};
