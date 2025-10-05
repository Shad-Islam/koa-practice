import Koa from "koa";
import { z } from "zod";
import cors from "@koa/cors";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";

import { env } from "./config/env.js";
import { User } from "./models/user.model.js";
import { validate } from "./middlewares/validate.js";
import { errorHandlingMiddleware } from "./middlewares/error.js";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .email("invalid email")
    .transform((v) => v.toLowerCase()),
});

export function createApp() {
  const app = new Koa();

  app.use(errorHandlingMiddleware);
  app.use(cors({ origin: "*" }));
  app.use(bodyParser());

  const router = new Router({ prefix: env.basePath });

  router.get("/", (ctx) => {
    ctx.body = {
      ok: true,
      message: "Hello World from Koa.js server!",
      time: new Date().toISOString(),
    };
  });

  router.get("/error", () => {
    const e = new Error("This is a test error");
    e.status = 418;
    throw e;
  });

  router.post("/echo", (ctx) => {
    ctx.body = { youSent: ctx.request.body };
  });

  // USER : List and Create
  router.get("/users", async (ctx) => {
    const users = await User.find().lean();
    ctx.body = { items: users, total: users.length };
  });

  router.post("/users", validate(createUserSchema), async (ctx) => {
    const { name, email } = ctx.request.validated;
    // if (!name || !email) {
    //   const e = new Error("Name and Email are required");
    //   e.status = 400;
    //   throw e;
    // }

    try {
      const doc = await User.create({ name, email });
      ctx.status = 201;
      ctx.set("Location", `${env.basePath}/users/${doc._id}`);
      ctx.body = { id: doc._id, name: doc.name, email: doc.email };
    } catch (error) {
      if (error.code === 11000) {
        const e = new Error("Email already exists");
        e.status = 409;
        throw e;
      }
      throw error;
    }
  });

  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
