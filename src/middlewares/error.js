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
    };
    if (status >= 500) {
      console.error("Server Error:", error);
    }
    ctx.app.emit("error", error, ctx);  
  }
}
