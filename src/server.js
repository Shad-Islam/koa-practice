// import Koa from 'koa';

const { createApp } = await import('./app.js');

const app = createApp();

// app.use(async (ctx) => {
//   ctx.body = {ok: true, message: 'Hello World from Koa.js server!'};
// });



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 