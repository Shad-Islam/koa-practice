export const validate = (schema) => async (ctx, next) => {
  const result = schema.safeParse(ctx.request.body);
  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      error: "Validation failed",
      details: result.error.flatten(),
    };
    return;
  }
  ctx.request.validated = result.data;
  await next();
};
