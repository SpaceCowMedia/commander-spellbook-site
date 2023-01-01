const { logger } = require("firebase-functions");

// abstract class, do not use directly
class ApiError extends Error {
  // private
  static defaultMessage = "Something went wrong.";

  // @arg message?: string | Error
  constructor(message) {
    super();

    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;

    if (typeof message !== "string") {
      message = message?.message;
    }

    // this is kind of a weird construction, but it basically
    // lets us set a static defaultMessage property on the
    // child classes and have them be automatically applied
    // to the instances of the child classes
    this.message = message || this.constructor.defaultMessage;
  }
}

class NotFoundError extends ApiError {
  static defaultMessage = "The requested resource could not be found.";
}

class PermissionError extends ApiError {
  static defaultMessage = "You do not have permission to perform this action.";

  constructor(message) {
    super(message);

    logger.warn(this.message);
  }
}

class UnknownError extends ApiError {
  constructor(message, originalError) {
    super(message);

    logger.error(this.message, originalError);
  }
}

class ValidationError extends ApiError {
  static defaultMessage = "A validation error occurred.";
}

module.exports = {
  NotFoundError,
  PermissionError,
  UnknownError,
  ValidationError,
};
