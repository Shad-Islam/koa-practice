import { Worker } from "bullmq";
import { redisClient } from "../config/redis.js";
import { connectToDatabase } from "../config/db.js";
import { User } from "../models/user.model.js";
import { env } from "../config/env.js";

console.log("[dailyEmailWorker] Using mongoUrl:", env.mongoUrl);
await connectToDatabase(env.mongoUrl);

export const dailyEmailWorker = new Worker(
  "emailQueue",
  async (job) => {
    if (job.name !== "dailyUserEmail") {
      return;
    }
    console.log("⏰ [dailyEmailWorker] Running dailyUserEmail job…");

    const users = await User.find({}, { name: 1, email: 1 }).lean();
    console.log(`👥 [dailyEmailWorker] Found ${users.length} users to email`);

    for (const user of users) {
      console.log(`✉️ [dailyEmailWorker] Sending email to ${user.email}`);
    }
  },
  { connection: redisClient }
);

dailyEmailWorker.on("completed", (job) => {
  console.log(`✅ [dailyEmailWorker] Job ${job.id} completed`);
});

dailyEmailWorker.on("failed", (job, err) => {
  console.error(`❌ [dailyEmailWorker] Job ${job?.id} failed:`, err?.message);
});
