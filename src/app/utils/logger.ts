import path from "path";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, label, printf } = format;

//formate log
const logFormate = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp as Date);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  return `{${date.toDateString()} ${hours}:${minutes}:${seconds}:${milliseconds}} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(label({ label: "Flex-LMS" }), timestamp(), logFormate),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        "logs",
        "winston",
        "success",
        "ec-%DATE%-success.log"
      ),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

const errorLogger = createLogger({
  level: "error",
  format: combine(label({ label: "Flex-LMS" }), timestamp(), logFormate),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        "logs",
        "winston",
        "error",
        "ec-%DATE%-error.log"
      ),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

const courierStatusUpdateError = createLogger({
  level: "error",
  format: combine(label({ label: "Flex-LMS" }), timestamp(), logFormate),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        "logs",
        "winston",
        "courierStatusUpdateError",
        "ec-%DATE%-error.log"
      ),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

const consoleLogger = createLogger({
  level: "info",
  format: combine(label({ label: "Flex-LMS" }), timestamp(), logFormate),
  transports: [new transports.Console()],
});

export { consoleLogger, courierStatusUpdateError, errorLogger, logger };
