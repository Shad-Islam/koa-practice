import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";

export function createApp() {
  const app = new Koa();
  const router = new Router();

  app.use(bodyParser());

  router.get("/", (ctx) => {
    ctx.body = {
      ok: true,
      message: "Hello World from Koa.js server!",
      time: new Date().toISOString(),
    };
  });

  router.post("/echo", (ctx) => {
    ctx.body = { youSent: ctx.request.body };
  });

  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
