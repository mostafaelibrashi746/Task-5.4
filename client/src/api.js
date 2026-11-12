import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true
})

let csrfToken
let csrfTokenRequest

async function getCsrfToken() {
  if (csrfToken) return csrfToken
  if (!csrfTokenRequest) {
    csrfTokenRequest = api.get('/csrf-token')
      .then(res => {
        csrfToken = res.data.csrfToken
        return csrfToken
      })
      .finally(() => { csrfTokenRequest = null })
  }
  return csrfTokenRequest
}

api.interceptors.request.use(async config => {
  if (!['post', 'put', 'patch', 'delete'].includes((config.method || 'get').toLowerCase())) return config
  if (/^\/auth\/(login|register)$/.test(config.url || '')) return config
  config.headers = config.headers || {}
  config.headers['x-csrf-token'] = await getCsrfToken()
  return config
})

api.interceptors.response.use(response => {
  if (/^\/auth\/(login|register|logout)$/.test(response.config.url || '')) csrfToken = undefined
  return response
})
