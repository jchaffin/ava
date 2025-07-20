import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'user' | 'admin'
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: 'user' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'user' | 'admin'
  }
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  confirmPassword: string
}