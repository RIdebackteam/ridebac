import axios from 'axios'

const api = axios.create({
  baseURL:  'https://ridebac.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rideback_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rideback_token')
      localStorage.removeItem('rideback_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
