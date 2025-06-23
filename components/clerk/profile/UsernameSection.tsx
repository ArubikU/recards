"use client"

import { Button } from "@/components/ui/button"
import { useReverification, useUser } from "@clerk/nextjs"
import { useState } from "react"

export default function UsernameSection() {
    const { user, isLoaded } = useUser()
    const [userName, setUserName] = useState(user?.username || "")
    const [updatingUserName, setUpdatingUserName] = useState(false)

    if (!isLoaded || !user) return null

    const updateWithVerification = useReverification(values => user?.update(values))
    const hasUsername = user.username && user.username.trim() !== ""

    const content = () => {
        if (updatingUserName) {
            return (
                <div className="border rounded-xl p-6 shadow-sm bg-ivory w-full max-w-md">
                    <h3 className="text-sm font-medium mb-4 text-gray-900">Update Username</h3>
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="border rounded-xl px-4 py-2 w-full"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                        <Button
                            variant="ghost"
                            className="hover:bg-gray-100 rounded-xl"
                            onClick={() => setUpdatingUserName(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-gray-800 rounded-xl text-white hover:bg-ink"
                            disabled={userName === (user.username || "")}
                            onClick={async () => {
                                updateWithVerification({ username: userName })
                                setUpdatingUserName(false)
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div>
                    {hasUsername ? (
                        <h3 className="text-md font-medium">{user.username}</h3>
                    ) : (
                        <h3 className="text-md font-medium">No username set</h3>
                    )}
                </div>
                <Button
                    className="bg-gray-100 rounded-xl hover:bg-gray-300 w-full sm:w-auto"
                    onClick={() => setUpdatingUserName(true)}
                >
                    {hasUsername ? "Update username" : "Set username"}
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 w-full max-w-xl">
            <h3 className="text-sm font-medium">Username</h3>
            {content()}
        </div>
    )
}
