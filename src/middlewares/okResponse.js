export default async (req, res, next) => {
  try {
    return res.send(res.locals.data);
  } catch (err) {
    return next(err);
  }
};
