import { CURRENCY } from "@/components/pricing/billingLabels";

// PayPal API client for handling payments
export async function createPayPalOrder(planId: string, period = "monthly", currency: CURRENCY = "PEN") {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId,
        period,
        currency,
      }),
    });


    if (!response.ok) {
      throw new Error("Error creating PayPal order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw error;
  }
}
//recurring payment
export async function createPayPalSubscription(planId: string, planName: string, amount: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/create-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId,
        planName,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error("Error creating PayPal subscription");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating PayPal subscription:", error);
    throw error;
  }
}
