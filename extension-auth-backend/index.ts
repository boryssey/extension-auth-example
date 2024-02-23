// server.js
const GOOGLE_CLIENT_ID = '157317161385-3t4hec9df5aeur8ed2cn46kg37m7po2o.apps.googleusercontent.com';


import express from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import { isLoggedInMiddleware } from './middleware';
import { getOrCreateUser, getUser } from './service';
import { createAccessToken, createRefreshToken, signJwt, verifyToken } from './jwt';
import cookieParser from 'cookie-parser'
import { config } from 'dotenv';

const app = express();

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(
  cors({
    // * wildcard is not allowed with credentials: true, so we need to specify the origins
    origin: ["http://localhost:3000"], // youtube needs to be in the list of origins, otherwise it won't work
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser())

const cookieOptions = process.env.NODE_ENV === 'production' ? {
  httpOnly: true,
  sameSite: 'none' as 'none',
  domain: process.env.BACKEND_URL,
  secure: true
} : {}
console.log(process.env.NODE_ENV, 'process.envprocess.env')

app.post("/auth/google", async (req, res) => {
  const { idToken } = req.body

  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payloadUser = ticket.getPayload();
    if (!payloadUser || !payloadUser.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const user = getOrCreateUser(payloadUser as { email: string })
    const access_token = createAccessToken({ id: user.id })
    const refresh_token = createRefreshToken({ id: user.id })

    res.cookie('access_token', access_token, cookieOptions)
    res.cookie('refresh_token', refresh_token, {
      ...cookieOptions,
      path: '/auth/refresh'
    })


    res.status(200)

    return res.json(user)
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Unauthorized' })
  }
})

app.get('/me', isLoggedInMiddleware, (req, res) => {
  return res.status(200).json(req.user)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.post('/auth/logout', (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    sameSite: 'none',
    domain: '61d0-2001-8a0-6d0c-de00-fced-1e23-dee2-8f67.ngrok-free.app',
    secure: true
  })
  res.clearCookie('refresh_token', {
    path: '/auth/refresh',
    httpOnly: true,
    sameSite: 'none',
    domain: '61d0-2001-8a0-6d0c-de00-fced-1e23-dee2-8f67.ngrok-free.app',
    secure: true
  })
  res.status(204).end()
})

app.post('/auth/refresh', (req, res) => {
  const { refresh_token } = req.cookies
  console.log("🚀 ~ app.post ~ refresh_token:", refresh_token)
  if (!refresh_token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const data = verifyToken(refresh_token);
    console.log("🚀 ~ app.post ~ data:", data)
    const user = getUser(data.sub.id)
    console.log("🚀 ~ app.post ~ user:", user)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const access_token = createAccessToken({ id: user.id })
    res.cookie('access_token', access_token, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
    })
    res.status(200)
    return res.json(user)
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Unauthorized' })
  }
})

app.get('/', isLoggedInMiddleware, (req, res) => {
  res.json({ message: 'Hello World' })
})



app.listen("3005", () => console.log("Server running on port 3005"));