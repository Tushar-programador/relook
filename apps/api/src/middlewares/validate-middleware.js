export function validate(schema, source = "body") {
  return function validationMiddleware(req, _res, next) {
    req[source] = schema.parse(req[source]);
    next();
  };
}