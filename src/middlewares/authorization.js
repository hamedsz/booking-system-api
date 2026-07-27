import db from '../models';
import ApiError from '../errors/ApiError';
import { ENV_BACKEND_HOST } from '../config/app';
import { TOKEN_TYPE } from '../constants/user';
import userService from '../services/UserService';

function authHeaderParser(hdrValue) {
  const re = /(\S+)\s+(\S+)/;
  if (typeof hdrValue !== 'string') {
    return null;
  }
  const matches = hdrValue.match(re);

  return matches && { schema: matches[1], value: matches[2] };
}

export default async function authorization(req, res, next) {
  const { User } = db;
  const bearer = authHeaderParser(req.get('Authorization'));
  /** Do nothing if authorization header do not exist */
  if (bearer == null || bearer.schema !== 'Bearer') {
    return next(new ApiError(401, 'authentication_error', 'unauthorized', 'Invalid Authorization header'));
  }

  try {
    const usr = await User.jwtVerify(bearer.value, ENV_BACKEND_HOST);
    const user = await userService.getById(usr.sub);

    if (usr.tokenType !== TOKEN_TYPE.ACCESS || !user) {
      return next(new ApiError(401, 'authentication_error', 'unauthorized', 'Invalid token'));
    }
    req.user = user;
    req.authToken = bearer.value;
  } catch (err) {
    const { name } = err;

    const invalidTokenErrorTypes = [
      'JsonWebTokenError',
      'JWEDecryptionFailed',
      'JWEInvalid',
      'JWTClaimValidationFailed',
      'TokenExpiredError',
      'JWTExpired',
    ];

    if (invalidTokenErrorTypes.includes(name)) {
      return next(new ApiError(401, 'authentication_error', 'unauthorized', '!ورود شما منقضی شده است، لطفا مجددا وارد شوید.'));
    }

    return next(err);
  }

  return next();
}
