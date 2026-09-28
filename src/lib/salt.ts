import { ResponseError, SaltVote } from '@space-cow-media/spellbook-client';
import { formatDuration, httpErrorMessage, rateLimitRetryAfterSeconds } from './httpErrors';

export const MAX_SALT = 4;

export const SALT_LEVELS = ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'];

export interface SaltStats {
  salt: number | null;
  voteCount: number;
}

export function formatSalt(salt: number): string {
  return salt.toFixed(2);
}

export function saltTier(salt: number): string {
  return `${SALT_LEVELS[Math.round(salt)]} salty`;
}

// A vote only refreshes the numbers: whether a combo has a score is up to the backend, when it recomputes `salt`.
export function liveSaltStats(stored: SaltStats, vote: SaltVote): SaltStats {
  return { salt: stored.salt === null ? null : vote.average, voteCount: vote.voteCount };
}

export interface SaltVoteError {
  message: string;
  loginRequired: boolean;
}

export function saltVoteError(error: unknown): SaltVoteError {
  if (!(error instanceof ResponseError)) {
    return {
      message: 'Commander Spellbook could not be reached. Check your connection and try again.',
      loginRequired: false,
    };
  }
  switch (error.response.status) {
    case 401:
      return { message: 'Your login has expired. Log in again to vote.', loginRequired: true };
    case 403:
      return {
        message:
          'Your account is not allowed to vote on salt. If you think this is a mistake, let us know on our Discord server.',
        loginRequired: false,
      };
    case 404:
      return { message: 'This combo cannot be voted on.', loginRequired: false };
    case 429:
      return {
        message: `You are voting too quickly. Please wait ${formatDuration(rateLimitRetryAfterSeconds(error) ?? 0)} and try again.`,
        loginRequired: false,
      };
    default:
      return { message: httpErrorMessage(error.response.status), loginRequired: false };
  }
}
