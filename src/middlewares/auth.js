import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authRequired() {
  return async (ctx, next) => {
    const header = ctx.get("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      ctx.status = 401;
      ctx.body = { ok: false, message: "Authorization token is missing" };
      return;
    }

    try {
      const payload = jwt.verify(token, env.jwtSecret);
      ctx.state.user = payload;
      await next();
    } catch {
      ctx.status = 401;
      ctx.body = { ok: false, message: "Invalid or expired token" };
    }
  };
}
