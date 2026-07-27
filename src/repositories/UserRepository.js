import { AbstractRepository } from './AbstractRepository';
import db from '../models';
import EmailExistsError from '../errors/EmailExistsError';

export default class UserRepository extends AbstractRepository {
  constructor() {
    super();
    this.model = db.User;
  }

  getByEmail(email) {
    return this.getOne({ where: { email } });
  }

  async create(data) {
    try {
      return await super.create(data);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new EmailExistsError();
      }

      throw err;
    }
  }
}
