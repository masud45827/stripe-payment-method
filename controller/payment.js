require("dotenv").config(); // Load environment variables

const stripe = require("stripe")(process.env.SECRET_KEY);
exports.createCheckoutSession = async (ctx) => {
  try {
    const {
      productName,
      price,
      email,
      Name,
      currency,
      successUrl,
      cancelUrl,
      phone,
    } = ctx.request.body;
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",

      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, //30 minutes expire limit
      metadata: {
        phone,
        Name,
        email,
      },
    });
    // product.sessionCreatedAt = session.created;
    // product.sessionId = session.id;
    // product.status = "pending";
    ctx.response.status = 200;
    ctx.response.body = {
      url: session.url,
      message: "success to create checkout session",
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Failed to create checkout session",
      error: error.message,
    };
  }
};

exports.handleWebhook = async (ctx) => {
  try {
    const sig = ctx.request.headers["stripe-signature"];
    const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET;
    const event = stripe.webhooks.constructEvent(
      (ctx.request.rawBody = ctx.request.body[Symbol.for("unparsedBody")]),
      sig,
      endpointSecret
    );
    if (event.type === "checkout.session.completed") {
      console.log("success payment");
      //==========success code;

      //const id = event.data.object.metadata.id;
      //   const product = await paymentModel.getProductBySessionId(ctx.appCtx, id);
      //   if (product.status === "success") {
      //     throw {
      //       status: 200,
      //       title: "Already paid for the product",
      //     };
      //   }
      //   await createProduct(ctx, product);
      //   paymentModel.updatePaymentStatus(ctx.appCtx, id, "success");
    } else if (event.type === "checkout.session.async_payment_failed") {
      //=payment failed
      console.log("=======payment failed====");
      // paymentModel.updatePaymentStatus(ctx.appCtx, id, "failed");
    }
    ctx.response.status = 200;
    ctx.response.body = {
      message: "successfully call webhook",
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Failed to create checkout session",
      error: error.message,
    };
  }
};
