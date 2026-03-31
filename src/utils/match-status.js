import { MATCH_STATUS } from '../validation/matches.js';

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
