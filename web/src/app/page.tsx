"use client"
import {GoogleLogin, GoogleOAuthProvider} from '@react-oauth/google';
import axios from 'axios';
import {getCookies} from 'cookies-next';
import {useEffect, useState} from 'react';
import style from './page.module.scss';

const backendURL = 'https://61d0-2001-8a0-6d0c-de00-fced-1e23-dee2-8f67.ngrok-free.app';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = backendURL;

const GOOGLE_CLIENT_ID = '157317161385-3t4hec9df5aeur8ed2cn46kg37m7po2o.apps.googleusercontent.com';


const LoginPage = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Login />
    </GoogleOAuthProvider>
  );
};

const authWithGoogle = async (callbackParameters: string | undefined) => {
  return axios.post('/auth/google', {idToken: callbackParameters});
};

const getUserInfo = async () => {
  return axios.get('/me');
}

const logout = async () => {
  return axios.post('/auth/logout');
}

const refreshToken = async () => {
  return axios.post('/auth/refresh');
}

const Login = () => {
  const [cookie, setCookie] = useState<any>();
  const [userInfo, setUserInfo] = useState<any>();

  useEffect(() => {
    setCookie(getCookies());
  }, []);

  useEffect(() => {
    if(cookie?.access_token) {
      getUserInfo().then((data: any) => {
        setUserInfo(data.data);
      });
    } else {
      setUserInfo(null);
    }
  }, [cookie])

  return (
    <div className={style.main}>
      <GoogleLogin
        width="200px"
        onSuccess={response => {
          authWithGoogle(response.credential).then((data: any) => {
            setCookie(getCookies());
          });
        }}
        onError={() => {
          console.log('error');
        }}
      />
      {cookie?.access_token && (
        <button onClick={() => {logout().then(() => {
          setCookie(getCookies());
          setUserInfo(null);
        })}}>
          logout
        </button>)}
      {cookie?.access_token && (
        <button onClick={() => {refreshToken().then(() => {
          setCookie(getCookies());
        })}}>
          refresh
        </button>)}
      <div>
        stored cookies: <br />
        {JSON.stringify(cookie, null, 2)}
      </div>
      <div>
        user data: <br />
        {userInfo?.email}
      </div>
    </div>
  );
};

export default LoginPage;
