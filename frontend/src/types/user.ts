export type UserRole = 'GUEST' | 'USER' | 'ADMIN'

export interface User {
  userId: number
  email: string
  role: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

// Backend TokenResponse shape — no userId/role; those are encoded in the JWT
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

// Claims decoded from the JWT payload
export interface JwtPayload {
  sub: string   // userId as string
  email: string
  role: string  // 'USER' | 'ADMIN'
}
