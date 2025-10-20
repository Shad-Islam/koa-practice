import { emailQueue } from "../jobs/emailQueue";

export async function sendWelcomeEmail(ctx) {
  const { email, name } = ctx.request.body;

  await emailQueue.add("sendWelcomeEmail", { email, name });

  ctx.status = 200;
  ctx.body = { message: "User registered, welcome email scheduled" };
}
