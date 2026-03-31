import { pgTable, serial, text, integer, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Define the Match Status Enum
// This ensures data integrity at the database level
export const matchStatusEnum = pgEnum('match_status', [ 'scheduled', 'live', 'finished' ] );

// 2. The Matches Table
export const matchSchema = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: text('sport').notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  status: matchStatusEnum('status').default('scheduled').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. The Commentary Table (The heart of the real-time app)
export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .references(() => matchSchema.id, { onDelete: 'cascade' })
    .notNull(),
  minute: integer('minute'),
  sequence: integer('sequence').notNull(), // To ensure correct order of events
  period: text('period'), // e.g., '1st Half', 'Q3'
  eventType: text('event_type').notNull(), // e.g., 'goal', 'foul', 'card'
  actor: text('actor'), // Player name
  team: text('team'), 
  message: text('message').notNull(),
  metadata: jsonb('metadata'), // Store extra stats like (xG, coordinates, etc.)
  tags: text('tags').array(), // Postgres array for fast filtering
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Define Relations (Optional but highly recommended for Drizzle Queries)
export const matchesRelations = relations(matchSchema, ({ many }) => ({
  commentaries: many(commentary),
}));

export const commentaryRelations = relations(commentary, ({ one }) => ({
  match: one(matchSchema, {
    fields: [commentary.matchId],
    references: [matchSchema.id],
  }),
}));