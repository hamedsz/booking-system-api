import errorService from '../services/ErrorService';

export default async (err, req, res, _next) => {
  const standardResponse = errorService.handle({
    err,
    body: req.body,
    headers: req.headers,
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    query: req.query,
    reqId: req.id,
  });

  return res.status ? res.status(err.status || 500).send(standardResponse) : res;
};
