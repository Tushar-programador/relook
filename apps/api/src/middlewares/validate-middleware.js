export function validate(schema, source = "body") {
  return function validationMiddleware(req, _res, next) {
    const parsed = schema.parse(req[source]);

    if (source === "query") {
      req.validated = {
        ...(req.validated || {}),
        query: parsed
      };
      return next();
    }

    req[source] = parsed;
    next();
  };
}