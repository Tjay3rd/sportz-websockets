import {Router} from "express";
import {createMatchValidator, listMatchesQueryValidator} from "../validation/matches.js";
import {matchSchema} from "../db/schema.js";
import {db} from "../db/db.js";
import {getMatchStatus} from "../utils/match-status.js";
import {desc} from "drizzle-orm";


export const matchRouter = Router();

const MAX_LIMIT = 100

matchRouter.get("/", async (req,res) => {
  const parsed = listMatchesQueryValidator.safeParse(req.query);
  if(!parsed.success){
    return res.status(400).json({error: "Invalid Query.", details: parsed.error.issues});
  }
  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

  try {
    const data = await db
        .select()
        .from(matchSchema)
        .orderBy(desc(matchSchema.createdAt))
        .limit(limit)

    res.json({data});
  }catch (e) {
    res.status(500).json({error: "Failed to list matches."})
  }

})

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchValidator.safeParse(req.body);

  if(!parsed.success) return res.status(400).json({error: "Invalid Payload.", details: parsed.error.issues})

  const{startTime, endTime, homeScore, awayScore} = parsed.data;

  try {

    const[event] = await db.insert(matchSchema).values({
      ...parsed.data,
      startTime: new Date(startTime),
      endTime: parsed.data.endTime ? new Date(endTime) : null,
      homeScore: homeScore ?? 0,
      awayScore: awayScore ?? 0,
      status: getMatchStatus(startTime, endTime) ?? 'SCHEDULED',
    }).returning()

    if(res.app.locals.broadcastMatchCreated) {
      res.app.locals.broadcastMatchCreated(event);
    }

    res.status(201).json({data: event});
  } catch (e) {
    res.status(500).json({error: "Failed to create match.", details: e.message})
  }
})