import http from './http'

export const uploadAvatar = (formData) =>
  http.post('/files/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const uploadPoster = (formData) =>
  http.post('/files/poster', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
