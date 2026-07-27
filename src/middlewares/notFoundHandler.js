import ApiError from '../errors/ApiError';

export default async (req, res, next) => {
  try {
    // If not match
    if (!req.route) {
      res.locals.reqId = req.id;
      throw new ApiError(
        404,
        'generic_error',
        'page_not_found',
        'Page not found',
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};
