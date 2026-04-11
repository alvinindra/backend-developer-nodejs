declare global {
  namespace Express {
    interface Request {
      requestId?: string
      rawBody?: string
      user?: {
        sub: string
        role: string
      }
    }
  }
}

export {}
