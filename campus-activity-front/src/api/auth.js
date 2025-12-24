import http from './http'

export const apiRegister = (data) => http.post('/auth/register', data)
export const apiLogin = (data) => http.post('/auth/login', data)
export const apiMe = () => http.get('/me/profile')
export const apiUpdateProfile = (data) => http.put('/me/profile', data)
export const apiUpdatePassword = (data) => http.put('/me/password', data)
export const apiLogout = () => http.post('/auth/logout')
