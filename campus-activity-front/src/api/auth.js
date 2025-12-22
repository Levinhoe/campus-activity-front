import http from './http'

export const apiRegister = (data) => http.post('/api/auth/register', data)
export const apiLogin = (data) => http.post('/api/auth/login', data)
export const apiMe = () => http.get('/api/auth/me')
