import type { Suggestion } from 'lib/home/suggestions';

const LOCAL_STORAGE_SESSIONS_KEY = 'commander-spellbook-salt-voting-sessions';
const SESSION_STORAGE_COUNTED_KEY = 'commander-spellbook-salt-voting-counted';

type Activity = 'visited' | 'voted';

type Sessions = Partial<Record<Activity, number>>;

function readSessions(): Sessions {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saltVotingSessions(activity: Activity): number {
  return readSessions()[activity] ?? 0;
}

export function rememberSaltVotingSession(activity: Activity): void {
  try {
    const counted: Activity[] = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_COUNTED_KEY) ?? '[]');
    if (counted.includes(activity)) {
      return;
    }
    sessionStorage.setItem(SESSION_STORAGE_COUNTED_KEY, JSON.stringify([...counted, activity]));
    const sessions = readSessions();
    localStorage.setItem(
      LOCAL_STORAGE_SESSIONS_KEY,
      JSON.stringify({ ...sessions, [activity]: (sessions[activity] ?? 0) + 1 }),
    );
  } catch {
    // storage is best-effort: without it, the salt voting suggestion keeps treating the user as new
  }
}

export const saltVotingSuggestion: Suggestion = {
  id: 'salt-voting',
  icon: 'salt',
  title: 'Got a minute for some salt?',
  message: 'Rate how salty combos feel to play against.',
  href: '/salt/',
  action: 'Vote on salt',
  chance: ({ loggedIn }) => {
    if (loggedIn) {
      const voted = saltVotingSessions('voted');
      return voted === 0 ? 1 : voted === 1 ? 0.5 : 0.3;
    }
    return saltVotingSessions('visited') === 0 ? 1 : 0.5;
  },
};
