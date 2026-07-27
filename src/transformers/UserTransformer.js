import { BaseTransformer } from './BaseTransformer';

export class UserTransformer extends BaseTransformer {
  item(data) {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
    };
  }
}

export default new UserTransformer();
