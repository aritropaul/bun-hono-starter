import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const sqlite = new Database('mydb.sqlite', { create: true });
export const db = drizzle(sqlite);