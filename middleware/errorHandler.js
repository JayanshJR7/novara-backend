/**
 * Error Handler Middleware - Handles all errors in the application
 * Provides consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  // Set status code (500 if not set)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Send error response
  res.json({
    message: err.message,
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

/**
 * Not Found Handler - Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export { errorHandler, notFound };