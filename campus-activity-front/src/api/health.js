import http from './http'

export function apiHealth() {
  return http.get('/api/health')
}
