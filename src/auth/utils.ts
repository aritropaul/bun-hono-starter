import { sign, verify } from "hono/jwt"
import { scrypt, randomBytes } from "crypto"

const secret = 'thisistherepayapp'

async function hashPassword(password: String) {
    let hash = new Promise((resolve, reject) => {
        const salt = randomBytes(8).toString("hex")
    scrypt(String(password), salt, 16, (err: any, derivedKey: any) => {
            if (err) reject(err);
            resolve(salt + ":" + derivedKey.toString('hex'))
        });
    })

    return hash
}

async function verifyPassword(password: String, hash: any) {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(":")
    scrypt(String(password), salt, 16, (err, derivedKey) => {
            if (err) reject(err);
            resolve(key == derivedKey.toString('hex'))
        });
    })
}

async function issueToken(userID: string, password: string, role: string) {
    const payload = {
        id: userID,
        password: await hashPassword(password),
        role: role,
      }
    const token = await sign(payload, secret)
    return token
}

async function validateToken(token: string) {
    return await verify(token, secret)
}

export { issueToken, validateToken, hashPassword, verifyPassword }