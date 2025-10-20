import { Worker } from "bullmq";
import { redisClient } from "../config/redis.js";

export const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    if (job.name === "sendWelcomeEmail") {
      const { email, name } = job.data;
      console.log(`Sending welcome email to ${name} at ${email}`);
     
    }
  },
  {
    connection: redisClient,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});
