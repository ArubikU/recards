import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId, planName } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 })
    }

    const paypalResponse = await fetch(`${process.env.PAYPAL_API_URL_PROD}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        plan_id: planId, // PayPal subscription plan ID
        application_context: {
          brand_name: "ReCards",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/activate-subscription?planId=${planId}&userId=${userId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
        },
        custom_id: userId, // Optional: track the user
      }),
    })

    if (!paypalResponse.ok) {
      const errorData = await paypalResponse.json()
      console.error("PayPal API error:", errorData)
      return NextResponse.json(
        { error: "Error creating PayPal subscription", details: errorData },
        { status: paypalResponse.status }
      )
    }

    const paypalData = await paypalResponse.json()

    return NextResponse.json({
      id: paypalData.id,
      status: paypalData.status,
      links: paypalData.links,
    })
  } catch (error) {
    console.error("Error creating PayPal subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
