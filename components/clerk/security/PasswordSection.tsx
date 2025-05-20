"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"

export default function PasswordSection() {

    const { user, isLoaded } = useUser()


    const [password, setPassword] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [updatingPassword, setUpdatingPassword] = useState(false)

    if (!isLoaded) return null
    if (!user) return null


    const content = () => {
        if (updatingPassword) {
            return (
                <div className="border rounded-xl p-6 shadow-sm bg-white">
                    <h3 className="text-sm font-medium mb-4 text-gray-900">Update Password</h3>
                    <div className="flex gap-4 mb-6">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border rounded-xl px-4 py-2 w-full"
                        />
                    </div>
                    <div className="flex gap-4 mb-6">
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="border rounded-xl px-4 py-2 w-full"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button
                            variant="ghost"
                            className="hover:bg-gray-100 rounded-xl"
                            onClick={() => setUpdatingPassword(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-gray-800 rounded-xl text-white hover:bg-gray-600"
                            disabled={password === ""}
                            onClick={async () => {
                                user.updatePassword({

                                    currentPassword,
                                    newPassword: password,
                                })
                                setUpdatingPassword(false)
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
                    <input
                        type="password"
                        value={"•".repeat(10)}
                        disabled
                        className=" rounded-xl px-4 py-2 w-full text-gray-900"
                    />
                </div>
                <Button onClick={() => setUpdatingPassword(true)}>
                    Set password
                </Button>
            </div>)
    }

    return (

        <div className="flex items-start py-4 border-b">
            <p className="text-sm font-medium w-32 shrink-0 mr-4 mt-2">Password</p>
            <div className="flex-grow">
                {content()}
            </div>
        </div>
    )
}