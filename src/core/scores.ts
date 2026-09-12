import type { GameEntry } from '../catalog/types';
import { readString } from './storage';

/**
 * Personal bests.
 *
 * The portal and the games are served from the same origin in production, so a
 * game's best score is already sitting in localStorage under a key the game
 * owns. The portal reads it directly — no game needs to be modified, and there
 * is no second copy of the number to keep in sync.
 */

/**
 * Scores pushed up by a running game this session (see `parseScoreReport`).
 * Held in memory only — localStorage stays the game's to own.
 */
const reported = new Map<string, number>();

/** Convention: a game stores its personal best under `<id>.best`. */
export function bestScoreKey(entry: Pick<GameEntry, 'id' | 'scoreKey'>): string {
  return entry.scoreKey ?? `${entry.id}.best`;
}

/**
 * Personal best for a game, or null when there is no usable record.
 *
 * Returns null rather than 0 for "never played" so the UI can say so instead of
 * showing a score the player never earned.
 */
export function readBest(entry: Pick<GameEntry, 'id' | 'scoreKey'>): number | null {
  const raw = readString(bestScoreKey(entry));
  const stored = Number(raw);
  const candidates = [
    Number.isFinite(stored) && stored > 0 ? stored : null,
    reported.get(entry.id) ?? null,
  ].filter((value): value is number => value !== null);

  return candidates.length === 0 ? null : Math.max(...candidates);
}

export interface ScoreReport {
  readonly gameId: string;
  readonly score: number;
}

/**
 * Remember a reported score. Returns true when it beat what the portal already
 * knew, so the caller can skip a redraw that would change nothing.
 */
export function recordReport(report: ScoreReport): boolean {
  const known = reported.get(report.gameId) ?? 0;
  if (report.score <= known) return false;
  reported.set(report.gameId, report.score);
  return true;
}

/**
 * Validate a `postMessage` from an embedded game.
 *
 * Optional channel: a game may push its score up as it plays so the card
 * updates without a reload. Nothing sends this yet, and nothing has to.
 *
 * Message data is untrusted input. Anything embedded — or any other page that
 * gets a handle on this window — can post here, so the origin is checked first
 * and every field is type-checked before it is believed. Returns null for
 * anything that does not match exactly.
 */
export function parseScoreReport(
  origin: string,
  data: unknown,
  expectedOrigin: string,
): ScoreReport | null {
  if (origin !== expectedOrigin) return null;
  if (typeof data !== 'object' || data === null) return null;

  const message = data as Record<string, unknown>;
  if (message.type !== 'portal:best') return null;

  const { gameId, score } = message;
  if (typeof gameId !== 'string' || gameId === '') return null;
  if (typeof score !== 'number' || !Number.isFinite(score) || score <= 0) return null;

  return { gameId, score };
}
