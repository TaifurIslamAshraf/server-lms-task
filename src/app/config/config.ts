import dotenv from "dotenv";

dotenv.config();

const env = process.env;

const config = {
  app: {
    port: Number(env.PORT) || 3000,
    env: env.NODE_ENV || "development",
  },
  database: {
    mongoUri: env.DB_URL || "mongodb://localhost:27017/your_database",
  },
  domains: {
    origin: env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    serverUrl: env.SERVER_URL || "http://localhost:4000",
    clientUrl: env.CLIENT_URL || "http://localhost:3000",
    adminUrl: env.ADMIN_URL || "http://localhost:3001",
  },
  security: {
    refreshTokenSecret: env.REFRESH_TOKEN_SECRET || "58439434343uy94334435748",
    accessTokenSecret: env.ACCESS_TOKEN_SECRET || "9804754894r5748746ty745876",
    mailVarificationTokenSecret:
      env.MAIL_VERIFICATION_TOKEN_SECRET || "lksfjsdpertu985ut59r",
    forgotPasswordTokenSecret:
      env.FORTGOT_PASSWORD_TOKEN_SECRET || "slfkjs9854985",
  },
  jwtExpires: {
    accessTokenExpire: env.ACCESS_TOKEN_EXPIRES,
    refreshTokenExpire: env.ACCESS_TOKEN_EXPIRES,
    mailVarificationTokenExpire: env.MAIL_VERIFICATION_TOKEN_EXPIRES,
    forgotPasswordTokenExpire: env.FORTGOT_PASSWORD_TOKEN_EXPIRES,
  },
  cookieExpire: {
    accessTokenCookieExpire: env.ACCESS_TOKEN_COOKIE_EXPIRES,
    refreshTokenCookieExpire: env.REFRESH_TOKEN_COOKIE_EXPIRES,
  },
  auth: {
    google: {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  cors: {
    allowedOrigins: (
      env.ALLOWED_ORIGINS || "http://localhost:3000, http://localhost:3001"
    ).split(",") as string | string[],
  },
  smtp: {
    smtpMail: env.SMTP_MAIL,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpService: env.SMTP_SERVICE,
    smtpPass: env.SMTP_PASS,
  },
  upload: {
    imageSize: env.UPLOAD_IMAGE_SIZE,
    videoSize: env.UPLOAD_VIDEO_SIZE,
    imageMaxCount: env.UPLOAD_IMAGE_MAX_COUNT,
    imageFormat: env.UPLOAD_IMAGE_FORMAT,
  },
};

export default config;
