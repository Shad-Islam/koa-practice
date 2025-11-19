export const env = {
  port: process.env.PORT || 3000,
  basePath: process.env.BASE_PATH || "/api",
  jwtSecret: process.env.JWT_SECRET,
  redisPort: process.env.REDIS_PORT || 6379,
  redisHost: process.env.REDIS_HOST || "redis",
  mongoUrl: process.env.MONGO_URL || process.env.MONGO_URI,
};
