import { updateMetadata } from "@/lib/db"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }
    const clerkClientInstance = await clerkClient()
    // Update user metadata to free plan
    await updateMetadata(userId, clerkClientInstance, [{ key: "plan", value: "free" }])

    // Redirect to profile page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?downgraded=true`)
  } catch (error) {
    console.error("Error downgrading to free plan:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=downgrade_failed`)
  }
}
