const Koa = require("koa");
const { koaBody } = require("koa-body");
const cors = require("@koa/cors");
const Router = require("koa-router");
const payment = require("./controller/payment");

const app = new Koa();
const router = new Router();

app.use(cors());

app.use(
  koaBody({
    includeUnparsed: true,
  })
);

router.post("/create-checkout-session", payment.createCheckoutSession);
router.post("/webhook", payment.handleWebhook);

app.use(router.routes()).use(router.allowedMethods());

app.listen(7000, () => {
  console.log("Server is running on port 7000");
});
