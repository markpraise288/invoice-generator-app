import { loadStripe } from "@stripe/stripe-js";

// Ensure your environment variable is set
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default stripePromise;
