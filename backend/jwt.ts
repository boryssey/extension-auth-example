import * as jwt from 'jsonwebtoken';


const tmpSecret = 'supersecrettest'

const signJwt = (sub: string | object, type: string, expiresIn: string | number = '30sec') => {
  return jwt.sign({ sub, type }, tmpSecret, { expiresIn });
}

interface TokenPayload {
  sub: string | any;
  type: string;
}

const verifyToken = (token: string) => {
  return jwt.verify(token, tmpSecret) as TokenPayload;
}

const createAccessToken = (sub: string | object) => {
  return signJwt(sub, 'access_token')
}

const createRefreshToken = (sub: string | object) => {
  return signJwt(sub, 'refresh_token', '7d')
}

export {
  signJwt,
  verifyToken,
  createAccessToken,
  createRefreshToken
}