import { LogLevel } from "./types";

type LogArgs = Parameters<typeof console.log>;

const log = (fx: (...args: LogArgs) => void, ...args: LogArgs) =>
  fx("[ELYSIA-FSR]", ...args);

export const createLogger = (level: LogLevel) => ({
  verbose: (...args: LogArgs) => {
    if (level < LogLevel.Verbose) return;
    return log(console.log, ...args);
  },
  info: (...args: LogArgs) => {
    if (level < LogLevel.Default) return;
    log(console.log, ...args);
  },
  warn: (...args: LogArgs) => {
    if (level < LogLevel.Default) return;
    log(console.warn, ...args);
  },
  error: (...args: LogArgs) => {
    if (level < LogLevel.Silent) return;
    log(console.error, ...args);
  },
});

export type Logger = ReturnType<typeof createLogger>;
