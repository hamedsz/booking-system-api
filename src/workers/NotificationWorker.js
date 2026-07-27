import EmailProvider from '../services/external/EmailService';
import userService from '../services/UserService';
import mentorService from '../services/MentorService';

async function handleBookingConfirmed(job) {
  const { userId, mentorId, startDateTime } = job.data;

  // Fetch data inside the worker to ensure we have the most up-to-date info
  const [user, mentor] = await Promise.all([
    userService.getById(userId),
    mentorService.getById(mentorId),
  ]);

  const formattedDate = new Date(startDateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Send User Email
  await EmailProvider.sendTemplate({
    to: user.email,
    subject: `Booking Confirmed with ${mentor.user.firstName} ${mentor.user.lastName}`,
    templateName: 'user-booking-confirmed',
    context: { userName: `${user.firstName} ${user.lastName}`, mentorName: `${mentor.user.firstName} ${mentor.user.lastName}`, formattedDate },
  });

  // Send Mentor Email
  await EmailProvider.sendTemplate({
    to: mentor.user.email,
    subject: `New Booking with ${user.firstName} ${user.lastName}`,
    templateName: 'mentor-new-booking',
    context: { userName: `${user.firstName} ${user.lastName}`, mentorName: `${mentor.user.firstName} ${mentor.user.lastName}`, formattedDate },
  });
}

export default {
  queueName: 'NotificationQueue',
  opts: { concurrency: 5 },
  handlers: {
    'booking-confirmed': handleBookingConfirmed,
    // 'booking-cancelled': handleBookingCancelled, <-- Add more jobs for this queue here
  },
};
