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
```

### src/types/user.ts
```typescript
import { Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role?: 'user' | 'admin'
}

export interface LoginCredentials {
  email: string
  password: string
}