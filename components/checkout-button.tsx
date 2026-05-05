"use client";

import { loadStripe } from "@stripe/stripe-js";
import stripePromise from "@/lib/stripe-client";

export function CheckoutButton({ priceId }: { priceId: string }) {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    // Call your backend to create a Checkout Session
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    });

    const session = await response.json();

    if (session.url) {
      window.location.href = session.url;
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
    >
      Checkout
    </button>
  );
}
