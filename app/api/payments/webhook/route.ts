import { updateMetadata } from "@/lib/db"
import { clerkClient } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

// This webhook handles PayPal IPN (Instant Payment Notification)
export async function POST(request: NextRequest) {
  try {
    // Verify the PayPal webhook signature
    // This is a simplified implementation - in production, you should verify the signature
    const payload = await request.text()

    // Parse the IPN message
    const params = new URLSearchParams(payload)
    const paymentStatus = params.get("payment_status")
    const txnType = params.get("txn_type")
    const receiverEmail = params.get("receiver_email")
    const customData = params.get("custom") // You can pass custom data like userId and planId here

    // Verify that the payment is completed and for your account
    if (paymentStatus === "Completed" && receiverEmail === process.env.PAYPAL_MERCHANT_EMAIL) {
      if (customData) {
        try {
          const { userId, planId } = JSON.parse(customData)
          const c = await clerkClient()
          // Update user metadata with new plan
          await updateMetadata(userId, c, [{ key: "plan", value: planId }])

          console.log(`Updated plan for user ${userId} to ${planId}`)
        } catch (error) {
          console.error("Error parsing custom data:", error)
        }
      }
    }

    // Respond with 200 OK to acknowledge receipt of the webhook
    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("Error processing PayPal webhook:", error)
    return new NextResponse("Error", { status: 500 })
  }
}
