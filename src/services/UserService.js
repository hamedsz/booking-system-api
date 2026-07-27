import UserRepository from '../repositories/UserRepository';
import {
  TOKEN_TYPE, TOKEN_EXPIRATION, TOKEN_LIFESPAN_MILISECOND, ROLES,
} from '../constants/user';
import UserNotFoundError from '../errors/UserNotFoundError';
import InvalidPasswordError from '../errors/InvalidPasswordError';
import db from '../models';
import InvalidRefreshToken from '../errors/InvalidRefreshToken';

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  getById(id) {
    return this.userRepository
      .getById(id);
  }

  getByEmail(email) {
    return this.userRepository
      .getByEmail(email);
  }

  create(data) {
    return this.userRepository.create(data);
  }

  async generateAccessToken(user) {
    const payload = {
      tokenType: TOKEN_TYPE.ACCESS,
    };

    return user.jwtSign(payload);
  }

  async login(email, password) {
    const user = await this.getByEmail(email);

    if (!user) {
      throw new UserNotFoundError();
    }

    const validPassword = await user.validPassword(password);

    if (!validPassword) {
      throw new InvalidPasswordError();
    }

    return {
      refreshToken: await user.getRefreshToken(TOKEN_EXPIRATION.ONE_WEEK),
      accessToken: await this.generateAccessToken(user),
      tokenExpiration: new Date().getTime() + TOKEN_LIFESPAN_MILISECOND.FIFTEEN_MINUTES,
      user,
    };
  }

  async decodeRefreshToken(token) {
    try {
      const { User } = db;
      return await User.jwtVerify(token);
    } catch (error) {
      throw new InvalidRefreshToken();
    }
  }

  async refreshToken(token) {
    const decoded = await this.decodeRefreshToken(token);

    if (decoded.tokenType !== TOKEN_TYPE.REFRESH) {
      throw new InvalidRefreshToken();
    }

    const user = await this.getById(decoded.id);

    if (!user) {
      throw new InvalidRefreshToken();
    }

    return {
      accessToken: await this.generateAccessToken(user),
      tokenExpiration: new Date().getTime() + TOKEN_LIFESPAN_MILISECOND.FIFTEEN_MINUTES,
      user,
    };
  }

  async register({
    email, password, firstName, lastName,
  }) {
    const user = await this.create({
      email,
      password,
      firstName,
      lastName,
      role: ROLES.USER,
    });

    return {
      refreshToken: await user.getRefreshToken(TOKEN_EXPIRATION.ONE_WEEK),
      accessToken: await this.generateAccessToken(user),
      tokenExpiration: new Date().getTime() + TOKEN_LIFESPAN_MILISECOND.FIFTEEN_MINUTES,
      user,
    };
  }
}

export default new UserService();
