import { emailQueue } from "./emailQueue.js";

async function main() {
  await emailQueue.add(
    "dailyUserEmail",
    {
      subject: "Your Daily Update",
      body: "Here is your daily update!",
    },
    {
      repeat: {
        cron: "*/1 * * * *",
        tz: "Asia/Dhaka",
      },
      jobId: "daily-user-email-11:45am",
    }
  );

  console.log("Scheduled daily user email at 11:45 AM Asia/Dhaka time.");
  process.exit(0);
}
main().catch((err) => {
  console.error("Error scheduling daily user email:", err);
  process.exit(1);
});
