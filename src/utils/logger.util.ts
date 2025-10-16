import winston from 'winston';

const isDev = process.env.NODE_ENV === 'dev';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    isDev ? winston.format.colorize({ all: true }) : winston.format.uncolorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});
