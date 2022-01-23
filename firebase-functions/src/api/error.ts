abstract class ApiError extends Error {
  protected static defaultMessage: string = "Something went wrong.";

  constructor(message?: string | Error) {
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
    this.message =
      message || (this.constructor as typeof ApiError).defaultMessage;
  }
}

export class PermissionError extends ApiError {
  protected static defaultMessage =
    "You do not have permission to perform this action.";
}

export class UnknownError extends ApiError {}

export class ValidationError extends ApiError {
  protected static defaultMessage = "A validation error occurred.";
}
