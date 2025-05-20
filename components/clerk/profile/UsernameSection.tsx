"use client"

import { Button } from "@/components/ui/button"
import { useReverification, useUser } from "@clerk/nextjs"
import { useState } from "react"

export default function UsernameSection() {

    const { user, isLoaded } = useUser()


    const [userName, setUserName] = useState(user?.username || "")
    const [updatingUserName, setUpdatingUserName] = useState(false)

    if (!isLoaded) return null
    if (!user) return null
    const updateWithVerification = useReverification(values => user?.update(values));

    const hasUsername = user.username && user.username.trim() !== ""

    const content = () => {
        if (updatingUserName) {
            return (
                <div className="border rounded-xl p-6 shadow-sm bg-white">
                    <h3 className="text-sm font-medium mb-4 text-gray-900">Update Username</h3>
                    <div className="flex gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="border rounded-xl px-4 py-2 w-full"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button
                            variant="ghost"
                            className="hover:bg-gray-100 rounded-xl"
                            onClick={() => setUpdatingUserName(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-gray-800 rounded-xl text-white hover:bg-gray-600"
                            disabled={userName === (user.username || "")}
                            onClick={async () => {
                                updateWithVerification({ username: userName })
                                setUpdatingUserName(false)
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>)
        }
        return (
            <div className="flex items-center gap-60 w-full">
                <div className="flex-1">
                    {hasUsername ? (
                        <h3 className="text-md font-medium">{user.username}</h3>
                    ) : (
                        <h3 className="text-md font-medium">No username set</h3>
                    )}
                </div>
                <Button onClick={() => setUpdatingUserName(true)}>
                    {hasUsername ? "Update username" : "Set username"}
                </Button>
            </div>)
    }

    return (

        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Username</h3>
            <div className="flex items-start">
                {content()}
            </div>
        </div>
    )
}