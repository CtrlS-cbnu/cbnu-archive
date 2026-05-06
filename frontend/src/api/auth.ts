import { api } from './axiosInstance'
import { useAuthStore } from '@/store/authStore'
import type { UserRole, LoginRequest, SignupRequest } from '@/types/user'

// Decode JWT payload without verification (trust the server)
const decodeJwt = (token: string): Record<string, unknown> => {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
}

export const login = async (data: LoginRequest): Promise<void> => {
  const res = await api.post<{ data: { accessToken: string; refreshToken: string } }>(
    '/api/v1/auth/login',
    data,
  )
  const { accessToken, refreshToken } = res.data.data
  // Extract userId (sub) and role directly from JWT to avoid an extra /me request
  const payload = decodeJwt(accessToken)
  useAuthStore.getState().setAuth(
    accessToken,
    refreshToken,
    Number(payload.sub),
    payload.role as UserRole,
  )
}

export const signup = (data: SignupRequest) => api.post('/api/v1/auth/signup', data)

// Backend blacklists the access token; Authorization header is added by the interceptor
export const logout = () => api.post('/api/v1/auth/logout')
