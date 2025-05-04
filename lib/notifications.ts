import { redis } from "./redis"
import { createLogger } from "./logger"

const logger = createLogger("Notifications")

export interface Notification {
  id: string
  userId: string
  type: "order_status" | "product_update" | "system" | "admin"
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: number
}

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(
    userId: string,
    type: Notification["type"],
    title: string,
    message: string,
    data?: any,
  ): Promise<Notification> {
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: Date.now(),
    }

    // Store notification in Redis
    await redis.lpush(`notifications:${userId}`, notification)

    // Trim the list to keep only the latest 100 notifications
    await redis.ltrim(`notifications:${userId}`, 0, 99)

    // Publish notification event
    await redis.publish("notifications", JSON.stringify(notification))

    logger.info(`Notification created for user: ${userId}`, {
      notificationId: notification.id,
      type,
    })

    return notification
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    try {
      const notifications = (await redis.lrange(`notifications:${userId}`, 0, limit - 1)) as Notification[]
      return notifications
    } catch (error) {
      logger.error(`Error getting notifications for user: ${userId}`, { error })
      return []
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      const notifications = await this.getUserNotifications(userId, 100)
      const index = notifications.findIndex((n) => n.id === notificationId)

      if (index === -1) {
        return false
      }

      notifications[index].read = true

      // Replace the entire list
      await redis.del(`notifications:${userId}`)

      if (notifications.length > 0) {
        await redis.lpush(`notifications:${userId}`, ...notifications)
      }

      return true
    } catch (error) {
      logger.error(`Error marking notification as read: ${notificationId}`, { error })
      return false
    }
  }

  /**
   * Create system notification for all users
   */
  static async createSystemNotification(title: string, message: string, data?: any): Promise<void> {
    const notification = {
      id: crypto.randomUUID(),
      type: "system" as const,
      title,
      message,
      data,
      read: false,
      createdAt: Date.now(),
    }

    // Store in system notifications
    await redis.lpush("notifications:system", notification)
    await redis.ltrim("notifications:system", 0, 99)

    // Publish to notification channel
    await redis.publish(
      "notifications",
      JSON.stringify({
        ...notification,
        userId: "all",
      }),
    )

    logger.info("System notification created", { notificationId: notification.id })
  }
}
