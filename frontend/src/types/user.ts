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

export interface SignupRequest {
  email: string
  password: string
  name: string
  studentNumber: string
}
