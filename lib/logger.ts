type LogLevel = "debug" | "info" | "warn" | "error"

class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(meta ? { meta } : {}),
    }

    // In production, you might want to use a proper logging service
    if (level === "error") {
      console.error(JSON.stringify(logEntry))
    } else if (level === "warn") {
      console.warn(JSON.stringify(logEntry))
    } else if (level === "info") {
      console.info(JSON.stringify(logEntry))
    } else {
      console.log(JSON.stringify(logEntry))
    }
  }

  debug(message: string, meta?: any) {
    this.log("debug", message, meta)
  }

  info(message: string, meta?: any) {
    this.log("info", message, meta)
  }

  warn(message: string, meta?: any) {
    this.log("warn", message, meta)
  }

  error(message: string, meta?: any) {
    this.log("error", message, meta)
  }
}

export const createLogger = (context: string) => {
  return new Logger(context)
}
