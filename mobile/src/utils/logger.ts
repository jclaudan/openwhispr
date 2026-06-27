const PREFIX = "[OpenWhispr]";

type LogLevel = "debug" | "info" | "warn" | "error";

function log(level: LogLevel, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `${timestamp} ${PREFIX} ${level.toUpperCase()}`;
  const args = [`${prefix} ${message}`];
  if (data !== undefined) args.push(data);

  switch (level) {
    case "debug":
      console.debug(...args);
      break;
    case "info":
      console.info(...args);
      break;
    case "warn":
      console.warn(...args);
      break;
    case "error":
      console.error(...args);
      break;
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log("debug", message, data),
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
};
