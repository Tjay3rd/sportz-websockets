import { MATCH_STATUS } from '../validation/matches.js';

/**
 * Determine a match's lifecycle status from a start time, optional end time, and a reference "now".
 * @param {Date|string|number} startTime - The match start time (Date object, ISO string, or timestamp).
 * @param {Date|string|number} [endTime] - Optional match end time (Date object, ISO string, or timestamp). If omitted, status is derived from duration and elapsed time.
 * @param {Date} [now=new Date()] - Reference time used to evaluate status; defaults to the current time.
 * @returns {('SCHEDULED'|'LIVE'|'FINISHED')|null} One of MATCH_STATUS.SCHEDULED, MATCH_STATUS.LIVE, or MATCH_STATUS.FINISHED; returns `null` when the provided startTime or endTime cannot be parsed as valid dates.
 */
export function getMatchStatus(startTime, endTime, now = new Date()) {

  const MAX_MATCH_DURATION_MS = 4 * 60 * 60 * 1000; //4hrs
  const start = new Date(startTime);

  if (isNaN(start.getTime())) return null;

  if (!endTime)  {

    const timeElapsed = now.getTime() - start.getTime();
    if (timeElapsed > MAX_MATCH_DURATION_MS) {
      return MATCH_STATUS.FINISHED;
    }
    if (now < start) {
      return MATCH_STATUS.SCHEDULED;
    }
    if (now > start + 5 ) return MATCH_STATUS.FINISHED;
    return MATCH_STATUS.LIVE;
  }


  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

/**
 * Synchronizes a match object's status with the status computed from its start/end times.
 * If the computed status cannot be determined, leaves the match status unchanged.
 * @param {{startTime: string|Date, endTime?: string|Date, status: string}} match - Object with `startTime`, optional `endTime`, and `status`; `status` will be updated when different from the computed status.
 * @param {(newStatus: string) => Promise<void>} updateStatus - Async function invoked with the new status when an update is required.
 * @returns {string} The match's status after synchronization (unchanged if the computed status was not determinable).
 */
export async function syncMatchStatus(match, updateStatus) {
  const currentStatus = getMatchStatus(match.startTime, match.endTime);
  if (!currentStatus) {
    return match.status;
  }
  if (match.status !== currentStatus) {
    await updateStatus(currentStatus);
    match.status = currentStatus;
  }
  return match.status;
}
