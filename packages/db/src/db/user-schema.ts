import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Application users (email/password auth, optionally linked to a GitHub App installation). */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  /** GitHub App installation id; null until the user installs the app. */
  installationId: text("installation_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;