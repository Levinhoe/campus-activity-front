import request from '@/utils/request'

export const apiHealth = () => request.get('/api/health')
