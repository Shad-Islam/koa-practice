import { timeStamp } from "console";
import { request } from "http";

export async function errorHandlingMiddleware(ctx, next) {
  try {
    await next();
  } catch (error) {
    const status = error.status || 500;
    ctx.status = status;
    ctx.body = {
      error: {
        message: error.message || "Internal Server Error",
        status: status,
      },
      method: ctx.method,
      path: ctx.path,
      requestId: ctx.state.requestId,
      timeStamp: new Date().toISOString(),
    };
    if (status >= 500) {
      console.error("Server Error:", error);
    }
    ctx.app.emit("error", error, ctx);
  }
}
