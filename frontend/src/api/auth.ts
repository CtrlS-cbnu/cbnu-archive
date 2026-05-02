import { api } from './axiosInstance'
import type { LoginRequest, LoginResponse, JwtPayload, UserRole } from '@/types/user'
import { useAuthStore } from '@/store/authStore'

// Decode JWT payload without a library — backend embeds userId, email, role in claims
function decodeJwt(token: string): JwtPayload {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
}

export const login = async (data: LoginRequest) => {
  const res = await api.post<{ success: boolean; data: LoginResponse }>('/api/v1/auth/login', data)
  const { accessToken, refreshToken } = res.data.data
  const claims = decodeJwt(accessToken)
  return {
    accessToken,
    refreshToken,
    userId: Number(claims.sub),
    role: claims.role as UserRole,
  }
}

export const logout = () => {
  const refreshToken = useAuthStore.getState().refreshToken
  return api.post('/api/v1/auth/logout', { refreshToken })
}
