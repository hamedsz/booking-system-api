import { BaseTransformer } from './BaseTransformer';

export class BookingTransformer extends BaseTransformer {
  item(data) {
    return {
      id: data.id,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      status: data.status,
      meetingLink: data.meetingLink,
      cancelledBy: data.cancelledBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      mentor: data.mentorProfile ? {
        id: data.mentorProfile.id,
        bio: data.mentorProfile.bio,
        isAcceptingBookings: data.mentorProfile.isAcceptingBookings,
        firstName: data.mentorProfile.user?.firstName,
        lastName: data.mentorProfile.user?.lastName,
      } : null,
      user: data.user ? {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      } : null,
    };
  }
}

export default new BookingTransformer();
