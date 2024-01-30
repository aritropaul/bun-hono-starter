import { sql } from "drizzle-orm";
import { db } from "./db";


db.run(sql`create table users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT, verified INTEGER, role INTEGER)`)
db.run(sql`insert into users values (0, "admin", "4a4650b5c643b057:92d8754a25d8838d52e7e35b16c0162f", "admin@localhost", 1, 1)`)