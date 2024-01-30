import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable('users', {
  id: integer('id'),
  username: text('username'),
  password: text('password'),
  email: text('email'),
  verified: integer('verified'),
  role: integer('role')
});


