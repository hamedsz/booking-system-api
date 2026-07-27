import { BaseTransformer } from './BaseTransformer';

export class MentorTransformer extends BaseTransformer {
  item(data) {
    return {
      id: data.id,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      bio: data.bio,
      isAcceptingBookings: data.isAcceptingBookings,
    };
  }
}

export default new MentorTransformer();
