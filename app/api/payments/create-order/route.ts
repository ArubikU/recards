import { plans } from "@/components/pricing/billingLabels"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authUser = await auth()
    const { userId } = authUser

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    const { planId, period } = await request.json()

    // Validate required fields
    if (!planId ) {
      console.error("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
  const currentPlan = user?.publicMetadata?.plan as string | undefined || "free"
    const currentPlanDetails = plans.find((plan) => plan.id === currentPlan ||  (plan.id === "ultimate" && currentPlan === "ultra"))
    const buyedPlanDetails = plans.find((plan) => plan.id === planId)
    if (!currentPlanDetails || !buyedPlanDetails) {
      return NextResponse.json({ error: "Invalid current plan" }, { status: 400 })
    }
    let isUpdate = currentPlan !== "free" && currentPlan !== planId
    //orderPriority
    let order = ["free", "premium", "ultimate", "ultra"]
    //update just if the plan is upper than the current plan
    if (order.indexOf(planId) <= order.indexOf(currentPlan)) {
      isUpdate = false
    }
    let amount = buyedPlanDetails.prices[period as keyof typeof buyedPlanDetails.prices]
    if (period === "monthly") {
      amount = isUpdate ? amount - currentPlanDetails.prices[period as keyof typeof currentPlanDetails.prices] : amount
    }else if (period === "quarterly") {
      amount = amount *  4
      isUpdate = false
    }
    else if (period === "yearly") {
      amount = amount * 12
      isUpdate = false
    }
    console.log(amount)

    // Create PayPal order
    const paypalResponse = await fetch(`${process.env.PAYPAL_API_URL_PROD}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: planId,
            description: `ReCards ${buyedPlanDetails.name} Plan`,
            amount: {
              currency_code: "USD",
              value: amount.toString(),
            },
          },
        ],
        application_context: {
          brand_name: "ReCards",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/capture-order?planId=${planId}&userId=${userId}&isUpdate=${isUpdate}&period=${period}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
        },
      }),
    })

    if (!paypalResponse.ok) {
      const errorData = await paypalResponse.json()
      console.error("PayPal API error:", errorData)
      return NextResponse.json(
        { error: "Error creating PayPal order", details: errorData },
        { status: paypalResponse.status },
      )
    }

    const paypalData = await paypalResponse.json()

    return NextResponse.json({
      id: paypalData.id,
      links: paypalData.links,
      status: paypalData.status,
    })
  } catch (error) {
    console.error("Error creating PayPal order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
