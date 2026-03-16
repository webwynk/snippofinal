import Stripe from "stripe";
import { asyncHandler, httpError } from "../utils/errorHelpers.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = "usd", metadata = {} } = req.body;

  if (!amount || amount <= 0) {
    throw httpError(400, "Invalid amount");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    throw httpError(500, error.message || "Failed to create payment intent");
  }
});
