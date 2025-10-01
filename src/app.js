import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";

import { errorHandlingMiddleware } from "./middlewares/error.js";
import { env } from "./config/env.js";

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

  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
