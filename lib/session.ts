import { redis } from "./redis"
import { createLogger } from "./logger"

const logger = createLogger("Session")

// Session TTL in seconds (default: 30 days)
const SESSION_TTL = 60 * 60 * 24 * 30

export interface SessionData {
  userId: string
  role: string
  email: string
  createdAt: number
  [key: string]: any
}

export class SessionManager {
  /**
   * Create a new session
   */
  static async createSession(userId: string, data: Omit<SessionData, "userId" | "createdAt">): Promise<string> {
    const sessionId = crypto.randomUUID()
    const sessionData: SessionData = {
      userId,
      createdAt: Date.now(),
      ...data,
    }

    await redis.set(`session:${sessionId}`, sessionData, { ex: SESSION_TTL })
    logger.info(`Session created for user: ${userId}`, { sessionId })

    return sessionId
  }

  /**
   * Get session data
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const session = (await redis.get(`session:${sessionId}`)) as SessionData | null

      if (!session) {
        logger.warn(`Session not found: ${sessionId}`)
        return null
      }

      // Extend session TTL on access
      await redis.expire(`session:${sessionId}`, SESSION_TTL)

      return session
    } catch (error) {
      logger.error(`Error retrieving session: ${sessionId}`, { error })
      return null
    }
  }

  /**
   * Update session data
   */
  static async updateSession(sessionId: string, data: Partial<SessionData>): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)

      if (!session) {
        return false
      }

      const updatedSession = { ...session, ...data }
      await redis.set(`session:${sessionId}`, updatedSession, { ex: SESSION_TTL })

      logger.info(`Session updated: ${sessionId}`)
      return true
    } catch (error) {
      logger.error(`Error updating session: ${sessionId}`, { error })
      return false
    }
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const result = await redis.del(`session:${sessionId}`)
      logger.info(`Session deleted: ${sessionId}`)
      return result === 1
    } catch (error) {
      logger.error(`Error deleting session: ${sessionId}`, { error })
      return false
    }
  }

  /**
   * Get all sessions for a user
   */
  static async getUserSessions(userId: string): Promise<string[]> {
    try {
      const keys = await redis.keys(`session:*`)
      const sessions = await Promise.all(
        keys.map(async (key) => {
          const session = (await redis.get(key)) as SessionData | null
          return { key, session }
        }),
      )

      const userSessionKeys = sessions
        .filter(({ session }) => session && session.userId === userId)
        .map(({ key }) => key.replace("session:", ""))

      return userSessionKeys
    } catch (error) {
      logger.error(`Error getting user sessions: ${userId}`, { error })
      return []
    }
  }
}
