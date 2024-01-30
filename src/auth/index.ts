import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { hashPassword, issueToken, validateToken, verifyPassword } from './utils';
import { db } from '../db/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const auth = new Hono();

auth.post('/token', async (c) => {

    const body = await c.req.json()
    let username = String(body['username'])
    let password = String(body['password'])
    let role = String(body['role'])

    if (username == null || password == null) {
        throw new HTTPException(500, { message: 'Data not found' })
    }
    let token = await issueToken(username, password, role)
    return c.json({token})

})

auth.post('/validate', async (c) => {
    const body = await c.req.json()
    let token = String(body['token'])
    let data = await validateToken(token)
    return c.json({data})
})


auth.post('/login', async (c) => {
    const body = await c.req.json()
    let username = String(body['username'])
    let password = String(body['password'])

    let data = await db.select({
        username: users.username,
        password: users.password,
    }).from(users).where(eq(users.username, username));

    if (data.length != 0) { 
        if (await verifyPassword(password, data[0]['password'])) {
            let token = await issueToken(username, password, 'user')
            return c.json({token})
        }
        else {
            return c.json({error: 'wrong username / password'}, 401)
        }
    }
    else {
        return c.json({error: 'wrong username / password'}, 401)
    }
}) 

auth.post('/register', async (c) => {
    const body = await c.req.json()

    type NewUser = typeof users.$inferInsert;

    const insertUser = async (user: NewUser) => {
        return await db.insert(users).values(user)
    }

    const newUser: NewUser = {
        email: String(body['email']),
        username: String(body['username']),
        password: String(await hashPassword(String(body['password'])))
    }

    try {await insertUser(newUser)}
    catch(e) {
        return c.json({"error" : e}, 400)
    }

    let data = await db.select().from(users).where(eq(users.username, String(body['username'])));
    return c.json({data}, 200)
    
})

export default auth