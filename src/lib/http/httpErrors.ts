const DEFAULT_RETRY_AFTER_SECONDS = 60;

export function retryAfterSeconds(response?: Response, fallback: number = DEFAULT_RETRY_AFTER_SECONDS): number {
  const header = response?.headers?.get('Retry-After');
  if (!header) {
    return fallback;
  }
  const delta = Number(header);
  if (Number.isFinite(delta)) {
    return Math.max(0, Math.ceil(delta));
  }
  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    return Math.max(0, Math.ceil((date - Date.now()) / 1000));
  }
  return fallback;
}

export function httpErrorStatus(err: unknown): number | undefined {
  const response = (err as { response?: Response } | undefined)?.response;
  return response?.status ?? (err as { status?: number } | undefined)?.status;
}

export function rateLimitRetryAfterSeconds(err: unknown, fallback?: number): number | undefined {
  if (httpErrorStatus(err) !== 429) {
    return undefined;
  }
  return retryAfterSeconds((err as { response?: Response }).response, fallback);
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return 'a moment';
  }
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

export function httpErrorMessage(status: number, retryAfter?: number): string {
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
      return `You are submitting too quickly. Please wait ${formatDuration(retryAfter ?? 0)} and try again.`;
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

// The counterpart of `httpErrorMessage` for reading data rather than submitting it
export function apiErrorMessage(status: number, retryAfter?: number): string {
  switch (status) {
    case 400:
      return 'The request was not valid. The link you followed may be broken or out of date.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to access this.';
    case 404:
      return 'What you are looking for could not be found.';
    case 408:
    case 504:
      return 'The server took too long to answer. Please try again in a few moments.';
    case 429:
      return `You are sending too many requests. Please wait ${formatDuration(retryAfter ?? 0)} and try again.`;
    case 502:
    case 503:
      return 'The server is temporarily unavailable. Please try again in a few minutes.';
    default:
      return 'Something went wrong. Please try again in a few minutes.';
  }
}
