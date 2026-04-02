import {z} from "zod";

export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
};

export const listMatchesQueryValidator = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const matchIdParamValidator = z.object({
  id: z.coerce.number().int().positive()
});

const isoDateValidator = z.iso.datetime();

export const createMatchValidator = z.object({
    sport: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    startTime: isoDateValidator,
    endTime: isoDateValidator.optional(),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  }).superRefine((data, ctx) => {
    if (data.startTime && data.endTime) {
      const starting = isoDateValidator.safeParse(data.startTime);
      const ending = isoDateValidator.safeParse(data.endTime);

      if (!starting.success || !ending.success) return;

      const start = new Date(starting.data).getTime();
      const end = new Date(ending.data).getTime();

      if (end <= start) {
        ctx.addIssue({
          code: /*z.ZodIssueCode.custom*/ "custom",
          path: ["endTime"],
          message: "endTime must be chronologically after startTime",
        })
      }
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});

