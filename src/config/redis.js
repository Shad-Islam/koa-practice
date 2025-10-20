import { Redis } from "ioredis";
import { env } from "./env.js";

export const redisClient = new Redis({
  host: env.redisHost || "127.0.0.1",
  port: env.redisPort || 6379,
  maxRetriesPerRequest: null,
});
 