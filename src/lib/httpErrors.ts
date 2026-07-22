export function httpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Some of the information provided is invalid. Please review the highlighted fields and try again.';
    case 401:
    case 403:
      return 'You are not authorized to perform this action. Please log in and try again.';
    case 404:
      return 'The resource you are trying to submit to could not be found.';
    case 408:
      return 'The request timed out. Please try again.';
    case 409:
      return 'This submission conflicts with existing data. It may already exist.';
    case 413:
      return 'Your submission is too large. Please shorten it and try again.';
    case 422:
      return 'Some of the information provided could not be processed. Please review your submission.';
    case 429:
      return 'You are submitting too quickly. Please wait a few seconds and try again.';
    case 500:
      return 'An unexpected server error happened. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again in a few moments.';
    default:
      if (status >= 500) {
        return 'An unexpected server error happened. Please try again later.';
      }
      if (status >= 400) {
        return 'There was a problem with your submission. Please try again.';
      }
      return 'An unexpected error happened. Please try again later.';
  }
}
