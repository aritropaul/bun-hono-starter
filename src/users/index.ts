import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { users } from "../db/schema";
import { db } from "../db/db";

import { eq } from 'drizzle-orm';
import { hashPassword } from '../auth/utils';


const userRouter = new Hono()

userRouter.get('/', async (c) => {

    let data = await db.select().from(users);

    if (data) {
        return c.json({data}, 200);
    }
    else {
        throw new HTTPException(500, { message: 'Data not found' })
    }
})

userRouter.get('/:id', async (c) => {

    let id = Number(c.req.param('id'))
    let data = await db.select().from(users).where(eq(users.id, id));
    if (data) {
        return c.json({data}, 200);
    }
    else {
        throw new HTTPException(500, { message: 'Data not found' })
    }
})

userRouter.post('/', async (c) => {

    const body = await c.req.json()
    type NewUser = typeof users.$inferInsert;

    const insertUser = async (user: NewUser) => {
        return await db.insert(users).values(user)
    }

    const newUser: NewUser = {
        email: String(body['email']),
        username: String(body['username']),
        password: String(await hashPassword(String(body['password']))),
    }

    try {await insertUser(newUser)}
    catch(e) {
        return c.json({"error" : e}, 400)
    }
    let data = await db.select().from(users).where(eq(users.username, String(body['username'])));
    return c.json({data}, 200)

})

userRouter.put('/:id', async (c) => {
    const body = await c.req.json()
    let id = Number(c.req.param('id'))
    let data = await db.select().from(users).where(eq(users.id, id));
    if (data) {
        let user = data[0]
        await db.update(users)
            .set({email: (body['email'] || user.email), username: (body['username'] || user.username)})
            .where(eq(users.id, id));
    }
    data = await db.select().from(users).where(eq(users.id, id));
    return c.json({data}, 200)

})

userRouter.delete('/:id', async (c) => {
    let id = Number(c.req.param('id'))
    try  { 
        await db.delete(users).where(eq(users.id, id));
    }
    catch(e) {
        return c.json({"error" : e}, 400)
    }
    return c.json({status: 'success'}, 200)
})

export default userRouter