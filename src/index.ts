import { Hono } from 'hono'
import userRouter from './users';
import { logger } from 'hono/logger';
import auth from './auth';
import { validateToken } from './auth/utils';

const app = new Hono();

app.get('/', (c) => {
    return c.json('GET /', 200)
})

app.route('/auth', auth)

app.use('*', logger())

app.use('/users', async(c, next) => {
    const bearer = c.req.header('Authorization')
    let token = bearer?.split(" ")[1] || ""
    if (token == "") {
        return c.json({"error": "Unauthorized"}, 401)
    }
    let data = await validateToken(token)
    if (data['role'] != 'admin') {
        return c.json({"error": "Unauthorized"}, 401)
        
    }
    await next()
})

app.route('/users', userRouter)

export default app