import Koa from "koa";
import { z } from "zod";
import cors from "@koa/cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import helmet from "koa-helmet";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";

import { env } from "./config/env.js";
import { User } from "./models/user.model.js";
import { emailQueue } from "./jobs/emailQueue.js";
import { authRequired } from "./middlewares/auth.js";
import { validate } from "./middlewares/validate.js";
import { logger } from "./middlewares/logger.js";
import { errorHandlingMiddleware } from "./middlewares/error.js";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .email("invalid email")
    .transform((v) => v.toLowerCase()),
});

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z
    .string()
    .trim()
    .email()
    .transform((v) => v.toLowerCase()),
  password: z.string().min(6, "password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((v) => v.toLowerCase()),
  password: z.string().min(6, "password must be at least 6 characters"),
});

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    env.jwtSecret,
    { expiresIn: "1h" }
  );
}

export function createApp() {
  const app = new Koa();

  app.use(errorHandlingMiddleware);
  app.use(logger);
  app.use(cors({ origin: "*" }));
  app.use(helmet());
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

  router.post("/auth/register", validate(registerSchema), async (ctx) => {
    const { name, email, password } = ctx.request.validated;

    // block duplicate
    const exists = await User.findOne({ email }).lean();
    if (exists) {
      const e = new Error("Email already exists");
      e.status = 409;
      throw e;
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    //  save user with passwordHash
    const user = await User.create({ name, email, passwordHash });

    // generate token
    const token = signToken(user);

    emailQueue.add(
      "sendWelcomeEmail",
      { email, name },
      { delay: 10000 },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    ctx.status = 201;
    ctx.body = {
      user: { id: user._id, name: user.name, email: user.email },
      token,
    };
  });

  router.post("/auth/login", validate(loginSchema), async (ctx) => {
    const { email, password } = ctx.request.validated;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      const e = new Error("Invalid credentials");
      e.status = 401;
      throw e;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const e = new Error("Invalid credentials");
      e.status = 401;
      throw e;
    }

    const token = signToken(user);
    ctx.body = {
      user: { id: user._id, name: user.name, email: user.email },
      token,
    };
  });

  // USER : List and Create
  router.get("/users", authRequired(), async (ctx) => {
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
