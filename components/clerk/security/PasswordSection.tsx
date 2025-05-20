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
          <h3 className="text-sm font-medium mb-4 text-gray-900">
            Update Password
          </h3>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-xl px-4 py-2 w-full"
            />
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border rounded-xl px-4 py-2 w-full"
            />
          </div>

          <div className="flex justify-end gap-4 mt-4 flex-wrap">
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
                await user.updatePassword({
                  currentPassword,
                  newPassword: password,
                })
                setUpdatingPassword(false)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full">
        <input
          type="password"
          value={"•".repeat(10)}
          disabled
          className="rounded-xl px-4 py-2 w-full md:w-auto text-gray-900"
        />
        <Button onClick={() => setUpdatingPassword(true)}>
          Set password
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-start py-4 border-b gap-2 md:gap-4">
      <p className="text-sm font-medium w-full md:w-32 shrink-0 mt-1">
        Password
      </p>
      <div className="flex-grow w-full">{content()}</div>
    </div>
  )
}
