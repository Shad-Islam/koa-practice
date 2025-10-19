import { randomUUID } from "crypto";

export async function logger(ctx, next) {
  const rid = randomUUID();
  ctx.state.requestId = rid;
  ctx.set("X-Request-Id", rid);

  const start = Date.now();

  try {
    await next();
  } finally {
    const ms = Date.now() - start;
    console.log(
      `${ctx.method} ${ctx.path} -> ${ctx.status} ${ms}ms [rid=${rid}]`
    );
  }
}
