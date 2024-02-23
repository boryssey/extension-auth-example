import { v4 } from 'uuid';

const users = {} as { [key: string]: { email: string; id: string; } };


const getOrCreateUser = (user: { email: string; }) => {
  let userFromDB = Object.entries(users).find(([id, u]) => u.email === user.email)
  if (userFromDB) {
    console.log('user already exists')
    return userFromDB[1]
  }
  console.log('create new user')
  const newId = v4()

  const newUser = { ...user, id: newId };
  users[newId] = newUser;

  return newUser
}

const getUser = (userId: string) => {

  return users[userId]
}

export {
  getOrCreateUser,
  getUser

}