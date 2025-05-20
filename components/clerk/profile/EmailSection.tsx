"use client"

import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"

export default function EmailSection() {
    const { user, isLoaded } = useUser()
    if (!isLoaded) return null
    if (!user) return null

    return (<>

        <h3 className="text-sm font-medium">Email addresses</h3>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span>{user.primaryEmailAddress?.emailAddress}</span>
                <Badge className="text-xs">Primary</Badge>
            </div>
        </div>
    </>)
}