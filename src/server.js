// import Koa from 'koa';
import "dotenv/config";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase } from "./config/db.js";

const app = createApp();

// app.use(async (ctx) => {
//   ctx.body = {ok: true, message: 'Hello World from Koa.js server!'};
// });

connectToDatabase(process.env.MONGO_URL).then(() => {
  app.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
  });
})
.catch((error) => {
  console.error("Failed to connect to the database:", error.message);
  process.exit(1);
}); 


