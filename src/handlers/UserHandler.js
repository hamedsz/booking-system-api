import EmailExistsError from '../errors/EmailExistsError';
import InvalidPasswordError from '../errors/InvalidPasswordError';
import InvalidRefreshToken from '../errors/InvalidRefreshToken';
import UserNotFoundError from '../errors/UserNotFoundError';
import userService from '../services/UserService';
import userTransformer from '../transformers/UserTransformer';
import BaseHandler from './BaseHandler';

export default class UserHandler extends BaseHandler {
  static async login(req) {
    const { body } = req;

    this.validate(
      body,
      {
        email: 'required|email',
        password: 'required|string|min:6',
      },
      'login_invalid',
    );

    try {
      const result = await userService.login(body.email, body.password);

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenExpiration: result.tokenExpiration,
        user: userTransformer.item(result.user),
      };
    } catch (err) {
      if (err instanceof UserNotFoundError || err instanceof InvalidPasswordError) {
        throw this.createValidationError('login_failed', 'Invalid email or password');
      }

      throw err;
    }
  }

  static async refreshToken(req) {
    const { body } = req;

    this.validate(
      body,
      {
        refreshToken: 'required|string',
      },
      'refresh_invalid',
    );

    try {
      const result = await userService.refreshToken(body.refreshToken);

      return {
        accessToken: result.accessToken,
        tokenExpiration: result.tokenExpiration,
        user: userTransformer.item(result.user),
      };
    } catch (err) {
      if (err instanceof InvalidRefreshToken) {
        throw this.createValidationError('refresh_failed', 'Invalid refresh token');
      }

      throw err;
    }
  }

  static async register(req) {
    const { body } = req;

    this.validate(
      body,
      {
        email: 'required|email',
        password: 'required|string|min:6',
        firstName: 'required|string',
        lastName: 'string',
      },
      'register_invalid',
    );

    try {
      const result = await userService.register({
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
      });

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenExpiration: result.tokenExpiration,
        user: userTransformer.item(result.user),
      };
    } catch (err) {
      if (err instanceof EmailExistsError) {
        throw this.createValidationError('register_failed', 'Email already exists');
      }

      throw err;
    }
  }
}
