import { createUser } from "@/lib/db"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"

// This endpoint handles Clerk webhooks to sync user data with our database
export async function POST(request: NextRequest) {
  const payload = await request.json()
  const headersList = await headers()
  const svix_id = headersList.get("svix-id")
  const svix_timestamp = headersList.get("svix-timestamp")
  const svix_signature = headersList.get("svix-signature")

  // If there are no svix headers, this isn't a webhook
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 })
  }

  // Get the Clerk webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET")
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  }

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret)

  let evt: any

  try {
    // Verify the webhook payload
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return NextResponse.json({ error: "Error verifying webhook" }, { status: 400 })
  }

  // Handle the webhook
  const { type, data } = evt

  // Handle user creation
  if (type === "user.created") {
    const { id, email_addresses } = data

    if (!id || !email_addresses || email_addresses.length === 0) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 })
    }

    try {
      // Create user in our database
      await createUser(id, email_addresses[0].email_address)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ error: "Error creating user" }, { status: 500 })
    }
  }

  // Return a 200 response for other event types
  return NextResponse.json({ success: true })
}
