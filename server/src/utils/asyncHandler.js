// This helper keeps route handlers readable by forwarding async errors to Express.
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

