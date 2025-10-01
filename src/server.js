import Koa from 'koa';

const app = new Koa();

app.use(async (ctx) => {
  ctx.body = {ok: true, message: 'Hello World from Koa.js server!'};
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 