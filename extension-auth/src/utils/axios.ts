import axios, { AxiosRequestConfig } from 'axios'
import fetchAdapter from "@haverstack/axios-fetch-adapter";

const axiosInstance = axios.create({
  baseURL: 'https://61d0-2001-8a0-6d0c-de00-fced-1e23-dee2-8f67.ngrok-free.app',
  adapter: fetchAdapter,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalConfig = (error.config as AxiosRequestConfig<any> & { _retry?: boolean })
    if (error.response && error.response.status === 401 && error.response.data.error === 'AccessTokenExpired') {
      console.log('DEBUGGER[INTERCEPTOR]:', 'Access token expired')
      if (!originalConfig._retry) {
        originalConfig._retry = true
        try {
          await refreshToken()
          console.log('DEBUGGER[INTERCEPTOR]:', 'Access token refreshed')
        } catch (refreshTokenError) {
          await logout()
          return await Promise.reject(refreshTokenError)
        }
        return await axiosInstance(originalConfig)
      } else {
        await logout()
      }
    }
    return await Promise.reject(error)
  }
)

const refreshToken = async () => await axiosInstance.post('/auth/refresh')
const logout = async () => await axiosInstance.post('/auth/logout')

export default axiosInstance;
