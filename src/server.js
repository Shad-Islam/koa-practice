// import Koa from 'koa';
import "dotenv/config";

import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

// app.use(async (ctx) => {
//   ctx.body = {ok: true, message: 'Hello World from Koa.js server!'};
// });

const PORT = env.port;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
